import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex h-screen bg-red-100 items-center justify-center">
      <Link href={'/dashboard'}>
        <Button className="cursor-pointer">Open Dashboard</Button>
      </Link>
    </div>
  )
}
