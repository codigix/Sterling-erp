const DesignProject = require('./backend/models/DesignProject');

async function test() {
  try {
    const projects = await DesignProject.findAll();
    console.log('Total projects found:', projects.length);
    if (projects.length > 0) {
      const first = projects[0];
      console.log('Testing findById for:', first.id);
      const detail = await DesignProject.findById(first.id);
      console.log('Detail found:', !!detail);
      if (detail) {
        console.log('Project Name:', detail.projectName);
        console.log('Is Root Card:', detail.isRootCard);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
