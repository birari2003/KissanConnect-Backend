const { JobProfile } = require('./models');

async function activateJob() {
    try {
        const [updated] = await JobProfile.update({ status: 'active' }, { where: { id: 1 } });
        if (updated) {
            console.log('Job ID 1 updated to active.');
        } else {
            console.log('Job ID 1 not found or already active.');
        }
    } catch (error) {
        console.error('Error updating job:', error);
    }
}

activateJob();
