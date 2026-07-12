import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { validFields } from "@/lib/cms";

async function owned(req: NextRequest, id: string) { const tenant = await verifyTenantAccess(req); if (!tenant) return null; return prisma.cmsCollection.findFirst({ where: { id, site: { tenantId: tenant.id } } }); }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) { const { collectionId } = await params; if (!await owned(req, collectionId)) return NextResponse.json({ error: "Not found" }, { status: 404 }); const b = await req.json(); if (b.fields && !validFields(b.fields)) return NextResponse.json({ error: "Invalid fields" }, { status: 400 }); const collection = await prisma.cmsCollection.update({ where: { id: collectionId }, data: { ...(b.name && { name: b.name }), ...(b.description !== undefined && { description: b.description }), ...(b.fields && { fields: b.fields }) } }); return NextResponse.json({ collection }); }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) { const { collectionId } = await params; if (!await owned(req, collectionId)) return NextResponse.json({ error: "Not found" }, { status: 404 }); await prisma.cmsCollection.delete({ where: { id: collectionId } }); return NextResponse.json({ success: true }); }
