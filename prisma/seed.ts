import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pm = await prisma.user.upsert({
    where: { email: "pm@example.com" },
    update: {},
    create: {
      name: "Priya Menon",
      email: "pm@example.com",
      phone: "+15550001111",
      role: "PM",
      discipline: "ALL",
    },
  });

  const mechEngineer = await prisma.user.upsert({
    where: { email: "mech@example.com" },
    update: {},
    create: {
      name: "Miguel Chen",
      email: "mech@example.com",
      phone: "+15550002222",
      role: "ENGINEER",
      discipline: "MECHANICAL",
    },
  });

  const fireEngineer = await prisma.user.upsert({
    where: { email: "fire@example.com" },
    update: {},
    create: {
      name: "Fatima Reyes",
      email: "fire@example.com",
      phone: "+15550003333",
      role: "ENGINEER",
      discipline: "FIRE_SAFETY",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      title: "Warehouse Retrofit — Building 4",
      description: "Retrofit HVAC and fire suppression systems for Building 4 warehouse expansion.",
      status: "SUBMITTED",
      pmId: pm.id,
    },
  });

  console.log("Seeded:", {
    pm: pm.email,
    mechEngineer: mechEngineer.email,
    fireEngineer: fireEngineer.email,
    project: project.title,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
