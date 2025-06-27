import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Data Alchemist</h1>
      <Button className="on hover:cursor-crosshair">Upload Data</Button>
    </main>
  );
}
