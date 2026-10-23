import { TOOLS_DATA, type ToolItem } from '../data/tools'

const ALIASES: Record<string, string> = {
  'compress-image': 'image-compressor',
  'resize-image': 'image-resizer',
  'remove-bg': 'background-remover',
  'bg-remover': 'background-remover',
  'invoice': 'invoice-gen',
  'receipt': 'receipt-gen',
  'bmi': 'bmi-calc',
  'uuid': 'uuid-v7',
  'image-to-pdf': 'file-to-pdf',
  'pdf-to-image': 'pdf-to-img',
  'regex': 'regex-tester',
  'json': 'json-format',
  'base64': 'base64-codec',
  'whatsapp': 'whatsapp-link',
}

export function getToolIdFromPath(pathname: string): string | null {
  if (!pathname || pathname === '/' || pathname === '/tools') return null

  let slug = pathname.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '')

  if (slug.startsWith('tools/')) {
    slug = slug.replace(/^tools\//, '')
  } else if (slug.startsWith('tool/')) {
    slug = slug.replace(/^tool\//, '')
  }

  if (ALIASES[slug]) {
    return ALIASES[slug]
  }

  const found = TOOLS_DATA.find((t) => t.id === slug)
  return found ? found.id : null
}

export function getToolItem(toolId: string): ToolItem | undefined {
  return TOOLS_DATA.find((t) => t.id === toolId)
}
