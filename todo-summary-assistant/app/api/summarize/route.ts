import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST() {
  try {
    // Initialize OpenAI client inside the function, not at the module level
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    // Get todos from Supabase
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .eq("completed", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!todos || todos.length === 0) {
      return NextResponse.json({ error: "No pending todos to summarize" }, { status: 400 })
    }

    // Generate summary using OpenAI
    const todoList = todos.map((todo) => `- ${todo.title}${todo.description ? `: ${todo.description}` : ""}`).join("\n")

    const prompt = `
      I have the following pending tasks in my todo list:
      
      ${todoList}
      
      Please provide a concise summary of these tasks, grouping related items if possible, 
      and suggest a priority order based on what seems most important. 
      Format the response in a way that would be clear and helpful when shared in a Slack channel.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes todo lists in a concise and actionable way.",
        },
        { role: "user", content: prompt },
      ],
    })

    const summary = completion.choices[0].message.content

    // Send to Slack
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

    if (!slackWebhookUrl) {
      return NextResponse.json({ error: "Slack webhook URL not configured" }, { status: 500 })
    }

    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📋 Todo Summary",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: summary || "No summary generated",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*Pending Tasks:* ${todos.length}`,
            },
          ],
        },
      ],
    }

    const slackResponse = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackPayload),
    })

    if (!slackResponse.ok) {
      const slackError = await slackResponse.text()
      return NextResponse.json({ error: `Failed to send to Slack: ${slackError}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error("Error in summarize endpoint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
