import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  const quote = await prisma.quote.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(quote);
}
