async function seedSuperAdmin(prisma) {
  const email = "admin@buildez.com";

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      email,
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log("✅ SUPER ADMIN READY:", user.email);
}

module.exports = seedSuperAdmin;
