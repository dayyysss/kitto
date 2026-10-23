import { QrGenerator } from '../qr/QrGenerator'
import { BulkQrGenerator } from './BulkQrGenerator'
import { PasswordTool } from './PasswordTool'
import { DevTools } from './DevTools'
import { VisualTools } from './VisualTools'
import { BackgroundRemover } from './BackgroundRemover'
import { FinanceTools } from './FinanceTools'
import { DocAcademicTools } from './DocAcademicTools'
import { LifestyleTools } from './LifestyleTools'
import { DevExtraTools } from './DevExtraTools'

interface ActiveToolWorkspaceProps {
  activeToolId: string
}

export function ActiveToolWorkspace({ activeToolId }: ActiveToolWorkspaceProps) {
  // QR Suite
  if (activeToolId === 'qr') return <QrGenerator />
  if (activeToolId === 'bulk-qr') return <BulkQrGenerator />

  // Password Tool
  if (activeToolId === 'password') return <PasswordTool />

  // Dev Codec & UUID
  if (activeToolId === 'uuid-v7') {
    return <DevTools initialTool="uuid" hideTabs={true} />
  }
  if (activeToolId === 'json-format') {
    return <DevTools initialTool="codec" initialCodecMode="json" hideTabs={true} />
  }
  if (activeToolId === 'base64-codec') {
    return <DevTools initialTool="codec" initialCodecMode="base64" hideTabs={true} />
  }
  if (activeToolId === 'dev') {
    return <DevTools initialTool="uuid" hideTabs={false} />
  }

  // Visual Suite
  if (activeToolId === 'background-remover') return <BackgroundRemover />
  if (
    activeToolId === 'screenshot-beautifier' ||
    activeToolId === 'color-palette' ||
    activeToolId === 'gradient-maker' ||
    activeToolId === 'image-compressor' ||
    activeToolId === 'image-resizer'
  ) {
    return (
      <VisualTools
        initialTool={
          activeToolId === 'color-palette'
            ? 'palette'
            : activeToolId === 'gradient-maker'
            ? 'gradient'
            : activeToolId === 'image-resizer'
            ? 'resizer'
            : activeToolId === 'image-compressor'
            ? 'compress'
            : 'screenshot'
        }
        hideTabs={true}
      />
    )
  }

  // Finance Suite
  if (
    activeToolId === 'invoice-gen' ||
    activeToolId === 'receipt-gen' ||
    activeToolId === 'currency-converter' ||
    activeToolId === 'loan-calculator' ||
    activeToolId === 'tax-calculator'
  ) {
    return (
      <FinanceTools
        initialTool={
          activeToolId === 'receipt-gen'
            ? 'receipt'
            : activeToolId === 'currency-converter'
            ? 'currency'
            : activeToolId === 'tax-calculator'
            ? 'tax'
            : activeToolId === 'loan-calculator'
            ? 'loan'
            : 'invoice'
        }
        hideTabs={true}
      />
    )
  }

  // Document Suite
  if (
    activeToolId === 'word-counter' ||
    activeToolId === 'pdf-merger' ||
    activeToolId === 'pdf-splitter' ||
    activeToolId === 'pdf-compressor' ||
    activeToolId === 'pdf-protect' ||
    activeToolId === 'file-to-pdf' ||
    activeToolId === 'pdf-to-img'
  ) {
    return <DocAcademicTools initialTool={activeToolId} hideTabs={true} />
  }

  // Lifestyle Suite
  if (
    activeToolId === 'bill-split' ||
    activeToolId === 'bmi-calc' ||
    activeToolId === 'calorie-tracker' ||
    activeToolId === 'habit-tracker' ||
    activeToolId === 'greeting-card'
  ) {
    return (
      <LifestyleTools
        initialTool={
          activeToolId === 'bmi-calc'
            ? 'bmi'
            : activeToolId === 'calorie-tracker'
            ? 'calorie'
            : activeToolId === 'habit-tracker'
            ? 'habit'
            : activeToolId === 'greeting-card'
            ? 'greeting'
            : 'bill'
        }
        hideTabs={true}
      />
    )
  }

  // Dev Extra Suite
  if (
    activeToolId === 'regex-tester' ||
    activeToolId === 'code-snap' ||
    activeToolId === 'whatsapp-link'
  ) {
    return (
      <DevExtraTools
        initialTool={
          activeToolId === 'code-snap'
            ? 'codesnap'
            : activeToolId === 'whatsapp-link'
            ? 'whatsapp'
            : 'regex'
        }
        hideTabs={true}
      />
    )
  }

  return <QrGenerator />
}
