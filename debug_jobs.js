const { JobProfile } = require('./models');

async function checkJobs() {
    try {
        const jobs = await JobProfile.findAll();
        console.log('Total jobs found:', jobs.length);
        jobs.forEach(job => {
            console.log(`ID: ${job.id}, Status: ${job.status}, Expires At: ${job.expires_at}`);
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

checkJobs();
