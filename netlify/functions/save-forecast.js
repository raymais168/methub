const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    try {
        const sql = neon(process.env.DATABASE_URL);
        const payload = JSON.parse(event.body);
        const result = await sql`
            INSERT INTO forecasts (date_picker, time_picker, utc_time, duty_forecaster, validity_time, towns, regions)
            VALUES (${payload.date_picker}, ${payload.time_picker}, ${payload.utc_time}, ${payload.duty_forecaster}, ${payload.validity_time}, ${JSON.stringify(payload.towns)}, ${JSON.stringify(payload.regions)})
            RETURNING id;
        `;
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ success: true, header_id: result[0].id }),
        };
    } catch (error) {
        console.error("Database Error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: false, error: error.message }),
        };
    }
};