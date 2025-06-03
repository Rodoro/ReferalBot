export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* TODO: Реализовать главную на которую будет вытаскиватся из всех проектов выжимка и также на ней будет реализована система тасков и всего подобного */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </main>
    </>
  );
}
