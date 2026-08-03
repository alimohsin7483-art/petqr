import { PrismaClient, PetSpecies, BillingProvider, SubscriptionStatus } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  // ── Plans ────────────────────────────────────────────────
  const free = await prisma.plan.upsert({
    where: { key: "free" },
    update: {},
    create: {
      key: "free",
      name: "Free",
      priceMonthlyUsd: 0,
      priceMonthlyInr: 0,
      maxPets: 1,
      features: { medicalRecords: false, prioritySupport: false, customQrDesign: false },
    },
  });

  await prisma.plan.upsert({
    where: { key: "plus" },
    update: {},
    create: {
      key: "plus",
      name: "Plus",
      priceMonthlyUsd: 4.99,
      priceMonthlyInr: 349,
      maxPets: 5,
      features: { medicalRecords: true, prioritySupport: false, customQrDesign: true },
    },
  });

  await prisma.plan.upsert({
    where: { key: "pro" },
    update: {},
    create: {
      key: "pro",
      name: "Pro",
      priceMonthlyUsd: 9.99,
      priceMonthlyInr: 699,
      maxPets: 25,
      features: { medicalRecords: true, prioritySupport: true, customQrDesign: true },
    },
  });

  // ── Demo owner + pet (local/dev only) ───────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@petlink.app" },
    update: {},
    create: {
      authUserId: "00000000-0000-0000-0000-000000000000",
      email: "demo@petlink.app",
      fullName: "Demo Owner",
      phone: "+911234567890",
      role: "OWNER",
    },
  });

  const demoPet = await prisma.pet.upsert({
    where: { publicSlug: "demo-pet-01" },
    update: {},
    create: {
      ownerId: demoUser.id,
      publicSlug: "demo-pet-01",
      name: "Bruno",
      species: PetSpecies.DOG,
      breed: "Labrador",
      color: "Golden",
    },
  });

  await prisma.qrCode.upsert({
    where: { slug: nanoid(12) },
    update: {},
    create: {
      petId: demoPet.id,
      slug: demoPet.publicSlug,
      isActive: true,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      planId: free.id,
      provider: BillingProvider.STRIPE,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  // ── Physical tag products — three real variants, not one lonely item ──
  await prisma.product.upsert({
    where: { id: "00000000-0000-0000-0000-000000000099" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000099",
      name: "Classic Steel Tag",
      description: "Brushed stainless steel, laser-etched QR. Our best-seller.",
      priceUsd: 14.99,
      priceInr: 799,
      visualVariant: "steel",
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "00000000-0000-0000-0000-000000000098" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000098",
      name: "Brass Heritage Tag",
      description: "Solid brass with an aged finish — develops character over time.",
      priceUsd: 19.99,
      priceInr: 1199,
      visualVariant: "brass",
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "00000000-0000-0000-0000-000000000097" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000097",
      name: "Matte Black Tag",
      description: "Powder-coated black steel — sleek, minimal, and scratch-resistant.",
      priceUsd: 16.99,
      priceInr: 949,
      visualVariant: "black",
      isActive: true,
    },
  });

  for (let i = 0; i < 5; i++) {
    const slug = nanoid(10);
    await prisma.physicalTag.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
  }

  console.log("Seed complete: 3 plans, 1 demo user, 1 demo pet, 1 product, 5 unclaimed tags.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
