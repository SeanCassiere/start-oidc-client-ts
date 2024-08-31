import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/logged-out')({
  component: () => <div>Hello /logged-out!</div>
})