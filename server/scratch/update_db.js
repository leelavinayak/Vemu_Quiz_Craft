const supabase = require('../config/supabase');

async function updateSchema() {
    console.log('Updating database schema...');
    
    // Add 'section' to users table
    try {
        const { error: userError } = await supabase.rpc('execute_sql', {
            sql_query: "ALTER TABLE users ADD COLUMN IF NOT EXISTS section TEXT DEFAULT '';"
        });
        if (userError) console.error('Error adding section to users:', userError.message);
        else console.log('Successfully added section to users table.');
    } catch (e) {
        console.error('RPC execute_sql might not be available:', e.message);
    }

    // Add targeting columns to quizzes table
    try {
        const { error: quizError } = await supabase.rpc('execute_sql', {
            sql_query: `
                ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS "targetYears" TEXT[] DEFAULT '{}';
                ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS "targetBranches" TEXT[] DEFAULT '{}';
                ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS "targetSections" TEXT[] DEFAULT '{}';
            `
        });
        if (quizError) console.error('Error adding columns to quizzes:', quizError.message);
        else console.log('Successfully added targeting columns to quizzes table.');
    } catch (e) {
        console.error('RPC execute_sql might not be available:', e.message);
    }
}

updateSchema();
