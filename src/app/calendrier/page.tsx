import { prisma } from "@/lib/prisma";
import CalendarView from "./CalendarView";

export default async function CalendrierPage() {
  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({
      where: { status: { in: ["IN_PROGRESS", "ON_HOLD"] } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return <CalendarView clients={clients} projects={projects} />;
}
