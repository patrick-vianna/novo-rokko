# Modulos do Rokko

Cada pasta aqui representa um modulo/vertical da empresa.

## Regras
- Cada modulo tem seus proprios componentes, hooks e tipos
- Use componentes compartilhados de `@/components/` (nao recrie)
- Use utilitarios de `@/lib/` e `@/utils/`
- NAO altere arquivos fora da pasta do seu modulo

## Estrutura de cada modulo
- `components/` — componentes React exclusivos do modulo
- `hooks/` — custom hooks do modulo
- `utils/` — funcoes auxiliares
- `types.ts` — interfaces e tipos TypeScript

## Como importar
Componentes do modulo: `import { X } from '@/modules/seu-modulo/components/X'`
Componentes compartilhados: `import { Badge } from '@/components/ui/badge'`
