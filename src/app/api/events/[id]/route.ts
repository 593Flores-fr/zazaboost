import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.allDay !== undefined && { allDay: body.allDay }),
      ...(body.clientId !== undefined && { clientId: body.clientId || null }),
      ...(body.projectId !== undefined && { projectId: body.projectId || null }),
    },
    include: { client: { select: { id: true, name: true } }, project: { select: { id: true, title: true } } },
  });
  return NextResponse.json(event);
}
