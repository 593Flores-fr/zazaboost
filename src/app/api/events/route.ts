import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";

    let where = {};
    if (upcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where = { date: { gte: today } };
    } else {
      const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
      const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth()));
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      where = { date: { gte: start, lte: end } };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { date: "asc" },
      ...(upcoming ? { take: 20 } : {}),
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, date, endDate, allDay, clientId, projectId } = body;

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay ?? false,
        clientId: clientId || null,
        projectId: projectId || null,
      },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
