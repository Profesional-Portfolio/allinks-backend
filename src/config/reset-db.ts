import prismadb from '@/infraestructure/prismadb';

async function resetDb() {
  await prismadb.platform.deleteMany({});
}

resetDb()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismadb.$disconnect();
  });
