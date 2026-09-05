import ChatWindow from "@/components/assistant/ChatWindow";

export default function AssistantPage() {
  return (
    <main className="store-container py-10">
      <h1 className="text-3xl font-bold">AI assistant</h1>
      <p className="mt-2 text-sm text-slate-500">
        Grounded in published catalog data and your own orders. Product facts are not invented in the UI.
      </p>
      <div className="mt-8">
        <ChatWindow />
      </div>
    </main>
  );
}
