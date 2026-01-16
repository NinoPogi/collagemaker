import { getUserProjects } from '@/app/actions';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
   const projects = await getUserProjects();


 

  return <DashboardClient projects={projects} />
}



