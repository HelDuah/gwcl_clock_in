import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  "Operations",
  "Distribution",
  "Customer Service",
  "Finance & Accounts",
  "Human Resources",
  "Engineering",
  "Security",
  "Administration",
  "Commercial",
];

const maleFirstNames = ["Kwame", "Kwabena", "Kwaku", "Yaw", "Kofi", "Kwadwo", "Kwasi", "Kojo", "Kobby", "Nana"];
const femaleFirstNames = ["Adwoa", "Abena", "Akua", "Yaa", "Afua", "Ama", "Akosua", "Efua", "Araba", "Serwaa"];
const surnames = [
  "Mensah", "Owusu", "Boateng", "Asante", "Agyeman", "Appiah", "Darko", "Osei", "Adjei", "Sarpong",
  "Amoah", "Ofori", "Kusi", "Antwi", "Baffour", "Nyarko", "Frimpong", "Acheampong", "Gyasi", "Yeboah",
  "Bediako", "Tetteh", "Amankwah", "Opoku", "Nkrumah", "Ansah", "Boadi", "Wiredu", "Dapaah", "Twumasi",
];

function buildName(i: number): string {
  const isFemale = i % 2 === 0;
  const first = isFemale ? femaleFirstNames[i % femaleFirstNames.length] : maleFirstNames[i % maleFirstNames.length];
  const last = surnames[i % surnames.length];
  return `${first} ${last}`;
}

async function main() {
  let idCounter = 1;
  const employees: { name: string; department: string; role: string; employeeId: string | null }[] = [];

  // 30 Senior Staff — with Employee IDs
  for (let i = 0; i < 30; i++) {
    employees.push({
      name: buildName(i),
      department: departments[i % departments.length],
      role: "Senior Staff",
      employeeId: `GWL-${String(idCounter++).padStart(4, "0")}`,
    });
  }

  // 30 Junior Staff — with Employee IDs
  for (let i = 0; i < 30; i++) {
    employees.push({
      name: buildName(i + 30),
      department: departments[(i + 3) % departments.length],
      role: "Junior Staff",
      employeeId: `GWL-${String(idCounter++).padStart(4, "0")}`,
    });
  }

  // 30 National Service Personnel — no Employee ID (found by name only)
  for (let i = 0; i < 30; i++) {
    employees.push({
      name: buildName(i + 60),
      department: departments[(i + 6) % departments.length],
      role: "National Service Personnel",
      employeeId: null,
    });
  }

  const result = await prisma.employee.createMany({
    data: employees,
    skipDuplicates: true,
  });

  console.log(`Seeded ${result.count} sample employees (of ${employees.length} attempted).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });