import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 1. Connect to Neon using the environment variable in Netlify
        const sql = neon(process.env.DATABASE_URL);
        
        // 2. Parse the data sent from your HTML form
        const payload = JSON.parse(event.body);
        
        // 3. Insert the data into the 'forecasts' table
        const result = await sql`
            INSERT INTO forecasts (
                date_picker, 
                time_picker, 
                utc_time, 
                duty_forecaster, 
                validity_time, 
                towns, 
                regions
            )
            VALUES (
                ${payload.date_picker}, 
                ${payload.time_picker}, 
                ${payload.utc_time}, 
                ${payload.duty_forecaster}, 
                ${payload.validity_time}, 
                ${JSON.stringify(payload.towns)}, 
                ${JSON.stringify(payload.regions)}
            )
            RETURNING id;
        `;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ 
                success: true, 
                header_id: result[0].id 
            }),
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: false, error: error.message }),
        };
    }
}