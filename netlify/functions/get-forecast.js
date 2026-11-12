const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Get the most recently saved forecast
        const result = await sql`
            SELECT * FROM forecasts 
            ORDER BY created_at DESC 
            LIMIT 1;
        `;

        // If no data is found
        if (result.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify([]),
            };
        }

        // Return the latest forecast
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message }),
        };
    }
}; 
