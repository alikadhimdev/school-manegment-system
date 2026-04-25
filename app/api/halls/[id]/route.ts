import { connectDB } from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        await connectDB();





    } catch (error) {

    }
}