import { generateObject } from 'ai'
import { z } from 'zod'

const classificationSchema = z.object({
  kind: z.enum(['Task', 'Note', 'Link']),
  confidence: z.number().min(0).max(1),
  reason: z.string().max(120),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = typeof body.text === 'string' ? body.text.trim() : ''

    if (!text || text.length > 5000) {
      return Response.json({ error: 'Text must be between 1 and 5000 characters.' }, { status: 400 })
    }

    const { object } = await generateObject({
      model: 'openai/gpt-5.4-mini',
      schema: classificationSchema,
      system: 'Classify quick captures for Nearline. A Task is an actionable item someone can do. A Note is an idea, thought, reminder, question, or reference without a clear action. A Link is primarily a URL or web resource. Choose exactly one category. Be concise and consistent.',
      prompt: `Classify this capture:\n\n${text}`,
      temperature: 0,
    })

    return Response.json(object)
  } catch {
    return Response.json({ error: 'Classification is temporarily unavailable.' }, { status: 502 })
  }
}
