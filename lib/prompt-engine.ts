export type Category = 'visual' | 'code' | 'content' | 'flux' | 'cursor'
export type Settings = { category: Category; idea: string; engine: string; style: string; detail: number; flags: string[]; ratio: string; negative: string }
export type PromptResult = { id: string; settings: Settings; text: string; score: number; variant: number; createdAt: string }
export type Recipe = { id: string; title: string; description: string; category: Category; style: string; engine: string; idea: string; art: string; tag: string }

export const categories = {
  visual: { label: 'Visual Art', engines: ['Midjourney v6', 'Flux', 'DALL·E 3'], styles: ['Cinematic', 'Photorealistic', 'Minimalist', 'Digital art', 'Analog film'], flags: ['Aspect ratio', 'Negative prompt', 'High detail'] },
  flux: { label: 'Flux Image', engines: ['Flux Pro', 'Flux Dev', 'Flux Schnell'], styles: ['Hyperrealistic', 'Cinematic', 'Editorial', '3D render', 'Concept art'], flags: ['Aspect ratio', 'Negative prompt', 'High detail', 'Seed control', 'Safety checker'] },
  code: { label: 'Code & Development', engines: ['Cursor AI', 'v0', 'Bolt'], styles: ['Production-ready', 'Minimalist', 'Enterprise architecture', 'Rapid prototype'], flags: ['Stack constraints', 'Accessibility', 'Include tests'] },
  cursor: { label: 'Cursor AI', engines: ['Cursor (GPT-4)', 'Cursor (Claude 3.5)', 'Cursor (o1)'], styles: ['Full-stack architecture', 'Refactoring', 'Debug mode', 'Feature implementation', 'Code review'], flags: ['File tree', 'Type safety', 'Error handling', 'Performance optimization', 'Documentation'] },
  content: { label: 'Content & Marketing', engines: ['Claude 3.5', 'ChatGPT'], styles: ['High-conversion', 'Conversational', 'Professional', 'Storytelling'], flags: ['SEO optimized', 'Call to action', 'Multiple headlines'] },
} satisfies Record<Category, { label: string; engines: string[]; styles: string[]; flags: string[] }>

export const recipes: Recipe[] = [
  { id: 'cyberpunk', title: 'Cinematic cyberpunk city', description: 'Turn a scene into a cinematic universe.', category: 'visual', style: 'Cinematic', engine: 'Midjourney v6', idea: 'A futuristic city at night, neon lights reflecting on rain-soaked streets, a lone figure with an umbrella.', art: 'cyberpunk', tag: 'Midjourney · Flux' },
  { id: 'saas', title: 'SaaS landing page', description: 'A beautiful page built to convert.', category: 'code', style: 'Production-ready', engine: 'v0', idea: 'Build a modern SaaS landing page for a productivity tool called Orbit, with a strong hero, product preview, feature grid, pricing, and testimonials.', art: 'saas', tag: 'v0 · Cursor' },
  { id: 'launch', title: 'Product launch campaign', description: 'Make your next big thing impossible to ignore.', category: 'content', style: 'High-conversion', engine: 'Claude 3.5', idea: 'Write a product launch campaign for a focus app for independent creators. Include a launch email, social posts, and a benefit-driven landing page headline.', art: 'launch', tag: 'Claude · ChatGPT' },
  { id: 'dashboard', title: 'Full-stack analytics dashboard', description: 'From complex data to clear insights.', category: 'code', style: 'Enterprise architecture', engine: 'Cursor AI', idea: 'Build a full-stack analytics dashboard for a subscription business with revenue metrics, customer cohorts, date filters, role-based access, and a PostgreSQL backend.', art: 'dashboard', tag: 'Cursor · Bolt' },
  { id: 'product', title: 'Editorial product photography', description: 'Studio-quality visuals, thoughtfully composed.', category: 'visual', style: 'Photorealistic', engine: 'Flux', idea: 'A luxury botanical skincare bottle on a travertine pedestal, soft morning sunlight, natural shadows and understated editorial styling.', art: 'product', tag: 'Flux' },
  { id: 'brand', title: 'A memorable brand story', description: 'Find the human story behind your brand.', category: 'content', style: 'Storytelling', engine: 'ChatGPT', idea: 'Create a compelling brand story for a small sustainable coffee roaster, centered on transparent sourcing, everyday rituals, and community.', art: 'launch', tag: 'ChatGPT' },
  { id: 'flux-portrait', title: 'Hyperrealistic portrait', description: 'Flux-powered ultra-detailed character art.', category: 'flux', style: 'Hyperrealistic', engine: 'Flux Pro', idea: 'A close-up portrait of an elderly fisherman with weathered skin, deep wrinkles, piercing blue eyes, wearing a wool cap, dramatic side lighting against a dark background.', art: 'product', tag: 'Flux Pro' },
  { id: 'flux-landscape', title: 'Surreal dreamscape', description: 'Otherworldly scenes with Flux precision.', category: 'flux', style: 'Concept art', engine: 'Flux Dev', idea: 'A floating island with waterfalls cascading into clouds, ancient ruins overgrown with bioluminescent vines, twin moons in a purple twilight sky.', art: 'cyberpunk', tag: 'Flux Dev' },
  { id: 'cursor-auth', title: 'Authentication system', description: 'Complete auth flow with Cursor AI.', category: 'cursor', style: 'Full-stack architecture', engine: 'Cursor (Claude 3.5)', idea: 'Build a complete authentication system with email/password and Google OAuth, JWT tokens, refresh tokens, role-based access control, password reset flow, and protected API routes.', art: 'dashboard', tag: 'Cursor · Claude' },
  { id: 'cursor-refactor', title: 'Legacy code refactoring', description: 'Modernize old codebases with AI.', category: 'cursor', style: 'Refactoring', engine: 'Cursor (GPT-4)', idea: 'Refactor a legacy Express.js REST API into a clean modular architecture with dependency injection, proper error handling middleware, request validation, and comprehensive integration tests.', art: 'saas', tag: 'Cursor · GPT-4' },
]
export const initialSettings: Settings = { category: 'visual', idea: recipes[0].idea, engine: 'Midjourney v6', style: 'Cinematic', detail: 1, flags: ['Aspect ratio', 'Negative prompt'], ratio: '16:9', negative: 'blurry, low quality, distorted, watermark, text' }
export function settingsForCategory(category: Category): Settings {
  return { ...initialSettings, category, idea: '', engine: categories[category].engines[0], style: categories[category].styles[0], flags: category === 'visual' ? ['Aspect ratio', 'Negative prompt'] : category === 'flux' ? ['Aspect ratio', 'Negative prompt', 'High detail'] : category === 'code' ? ['Accessibility', 'Include tests'] : category === 'cursor' ? ['File tree', 'Type safety', 'Error handling'] : ['Call to action'] }
}
export function settingsForRecipe(recipe: Recipe): Settings { return { ...settingsForCategory(recipe.category), idea: recipe.idea, engine: recipe.engine, style: recipe.style } }

export function buildPrompt(settings: Settings, variant = 0): { text: string; score: number } {
  const { category, idea, engine, style, detail, flags, ratio, negative } = settings
  const blocks: string[] = []
  const add = (title: string, content: string) => blocks.push(`# ${title}\n${content}`)
  const approaches = category === 'visual' || category === 'flux' ? ['Use a wide establishing shot with a strong focal point, layered depth, and a carefully balanced composition.', 'Use an intimate low-angle composition, foreground framing, and dramatic depth of field.', 'Use a high-angle perspective, generous negative space, and geometric leading lines.'] : category === 'code' || category === 'cursor' ? ['Favor small composable components and explicit data flow.', 'Organize around feature modules with a clearly separated domain layer.', 'Use a progressively enhanced, server-first architecture with minimal client-side JavaScript.'] : ['Lead with the audience\'s problem, then connect the benefit to a clear next step.', 'Open with an unexpected insight, build credibility, and close with a practical invitation.', 'Tell a relatable customer story, show the transformation, then present the offer.']
  if (category === 'visual' || category === 'flux') {
    const isFlux = category === 'flux'
    add('SUBJECT & SCENE', idea.trim())
    add('STYLE & DIRECTION', `${style} visual treatment. ${style === 'Cinematic' ? 'Atmospheric lighting, rich color grading, subtle film grain, and immersive visual storytelling.' : style === 'Photorealistic' || style === 'Hyperrealistic' ? 'Physically plausible materials, natural lighting, true-to-life textures, and realistic proportions. Ultra-fine skin and surface detail.' : style === 'Minimalist' ? 'Restrained palette, simple forms, uncluttered surroundings, and intentional negative space.' : style === 'Editorial' ? 'Magazine-quality composition, refined color palette, professional styling, and deliberate visual hierarchy.' : style === '3D render' ? 'Physically based rendering, accurate light bounces, realistic materials, and clean geometry.' : style === 'Concept art' ? 'Imaginative world-building, dramatic atmosphere, and a cohesive visual language with strong silhouettes.' : style === 'Analog film' ? 'Organic film texture, soft highlight rolloff, muted colors, and a candid editorial sensibility.' : 'Expressive digital illustration, intentional brushwork, and a cohesive visual language.'}`)
    if (detail > 0) add('COMPOSITION & LIGHTING', `${approaches[variant % 3]}\nMotivated key lighting, subtle rim light, and controlled contrast. Preserve important details in both highlights and shadows.`)
    if (detail === 2) add('MATERIALS & FINISH', 'Describe distinct surface textures, realistic reflections, and a cohesive palette. Establish foreground, middle ground, and background. Keep the subject readable at thumbnail scale and avoid competing focal points.')
    if (flags.includes('High detail')) add('DETAIL PRIORITY', 'Prioritize fine material textures, accurate small-scale geometry, and crisp detail around the focal subject without oversharpening.')
    if (flags.includes('Negative prompt') && negative.trim()) add('AVOID', negative.trim())
    if (isFlux && flags.includes('Seed control')) add('SEED & REPRODUCIBILITY', 'Use a fixed seed for reproducible results. Document the seed value alongside the prompt for consistent iteration.')
    if (isFlux && flags.includes('Safety checker')) add('SAFETY & CONTENT GUIDELINES', 'Enable safety checker to filter inappropriate content. Ensure the prompt adheres to content policies and avoids harmful or explicit imagery.')
    const params = isFlux ? `${flags.includes('Aspect ratio') ? `${ratio} aspect ratio · ` : ''}${engine} · guidance scale: ${[3.5, 4.0, 7.5][variant % 3]} · ${style} treatment${flags.includes('Seed control') ? ` · seed: ${42 + variant}` : ''}` : `${engine === 'Midjourney v6' ? `${flags.includes('Aspect ratio') ? `--ar ${ratio} ` : ''}--v 6 --style raw --s ${[250, 180, 320][variant % 3]}` : `${engine} · ${flags.includes('Aspect ratio') ? `${ratio} aspect ratio · ` : ''}${style} treatment`}`
    add('PARAMETERS', params)
  } else if (category === 'code' || category === 'cursor') {
    const isCursor = category === 'cursor'
    add('ROLE & OBJECTIVE', `Act as a senior ${isCursor ? 'AI-assisted ' : ''}product engineer working in ${engine}.\n${idea.trim()}`)
    add('ARCHITECTURE', `${style} implementation. ${approaches[variant % 3]} Clearly state assumptions and do not invent unavailable services.`)
    if (detail > 0) add('IMPLEMENTATION REQUIREMENTS', 'Break down the application into focused components. Define typed data models and API contracts. Handle loading, empty, success, and error states. Validate inputs on the server and protect privileged operations.')
    if (isCursor && flags.includes('File tree')) add('FILE STRUCTURE', 'Provide a complete file tree showing the project organization. Each file should have a clear single responsibility. Include configuration files, source directories, and test directories.')
    if (flags.includes('Stack constraints') || (isCursor && flags.includes('Type safety'))) add('TECH STACK', 'Next.js App Router, React, TypeScript, Tailwind CSS, and PostgreSQL. Use server components by default and parameterized database queries. Keep secrets server-side. Enforce strict type safety across all modules.')
    if (flags.includes('Accessibility')) add('ACCESSIBILITY', 'Target WCAG 2.2 AA. Use semantic HTML, accessible labels, keyboard navigation, visible focus indicators, and sufficient contrast. Support mobile, tablet, and desktop layouts.')
    if (flags.includes('Include tests') || (isCursor && flags.includes('Error handling'))) add('TESTING & ERROR HANDLING', 'Include unit tests for business logic and integration tests for the primary user flow. Cover input validation, permission boundaries, and failure states. Implement comprehensive error handling with user-friendly messages and proper logging.')
    if (isCursor && flags.includes('Performance optimization')) add('PERFORMANCE', 'Optimize for Core Web Vitals. Use code splitting, lazy loading, and proper caching strategies. Minimize bundle size and reduce unnecessary re-renders. Profile and document performance bottlenecks.')
    if (isCursor && flags.includes('Documentation')) add('DOCUMENTATION', 'Include inline code comments for complex logic, a README with setup instructions, API documentation, and architectural decision records. Explain non-obvious design choices.')
    if (detail === 2) add('DELIVERY CHECKLIST', 'Provide a file tree, complete implementation, setup steps, environment variable names without secret values, migration strategy, and deployment notes. Explain architectural trade-offs and verify the acceptance criteria.')
    add('OUTPUT FORMAT', detail === 0 ? 'Return a concise implementation plan and the essential code.' : 'Start with a brief plan, then provide complete code organized by file path. Avoid placeholders and identify any external setup required.')
  } else {
    add('ROLE & BRIEF', `Act as an expert copywriter working in ${engine}.\n${idea.trim()}`)
    add('VOICE & STRATEGY', `${style} tone. ${approaches[variant % 3]} Use specific, concrete language and avoid generic hype.`)
    if (detail > 0) add('AUDIENCE & STRUCTURE', 'Infer the likely audience from the brief and label assumptions. Lead with a clear benefit, explain the offer, and address a likely objection. Use short paragraphs, descriptive headings, and scannable copy.')
    if (flags.includes('SEO optimized')) add('SEO REQUIREMENTS', 'Propose a primary search intent, a natural keyword phrase, a page title under 60 characters, and a meta description under 160 characters. Never sacrifice readability for keyword density.')
    if (flags.includes('Call to action')) add('CALL TO ACTION', 'Close with one specific, low-friction action. Make the next step and its benefit clear. Do not invent urgency, scarcity, or guarantees.')
    if (flags.includes('Multiple headlines')) add('HEADLINE VARIATIONS', 'Include five distinct headline options: benefit-led, problem-led, curiosity-led, direct, and story-led.')
    if (detail === 2) add('EDITORIAL CHECKLIST', 'Include a message hierarchy, channel-specific adaptations, and an A/B testing hypothesis. Review for clarity, inclusivity, consistency, and unsupported claims.')
    add('OUTPUT FORMAT', `${detail === 0 ? 'Return concise, ready-to-use copy.' : 'Return polished copy with labeled sections and a short rationale.'} Do not fabricate statistics, customer quotes, or product capabilities.`)
  }
  if (detail === 0 && variant > 0) add('CREATIVE APPROACH', approaches[variant % 3])
  return { text: blocks.join('\n\n'), score: Math.min(98, 70 + Math.min(12, Math.floor(idea.trim().length / 10)) + detail * 5 + flags.length * 3) }
}
export const initialResult: PromptResult = { id: 'starter', settings: initialSettings, ...buildPrompt(initialSettings), variant: 0, createdAt: 'Example prompt' }
export function exportPrompt(result: PromptResult, format: 'json' | 'txt') {
  const blob = new Blob([format === 'json' ? JSON.stringify(result, null, 2) : result.text], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `promptcraft-${result.settings.category}-v${result.variant + 1}.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
