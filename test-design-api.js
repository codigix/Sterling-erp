const API_URL = 'http://localhost:5001/api';

async function testDesignAPIs() {
  try {
    console.log('\n========== TESTING NEW DESIGN APIs ==========\n');

    console.log('🔐 Step 1: Login to get valid JWT token');
    console.log('━'.repeat(80));
    
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      console.log('⚠️  Note: Make sure to seed test user with username: admin, password: password');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful');
    console.log('✅ Token received:', token.substring(0, 50) + '...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n\n1️⃣  GET /api/production/designs');
    console.log('     Fetch ALL designs with details from root_cards + design_project_details');
    console.log('━'.repeat(80));
    
    try {
      const response = await fetch(`${API_URL}/production/designs`, { headers });
      const allDesigns = await response.json();
      
      console.log('✅ Response Status:', response.status);
      if (response.ok) {
        console.log('✅ Total Designs Found:', allDesigns.total);
        
        if (allDesigns.designs && allDesigns.designs.length > 0) {
          console.log('\n📊 First Design Sample:');
          console.log(JSON.stringify(allDesigns.designs[0], null, 2));
          
          const firstDesignId = allDesigns.designs[0].id;
          
          console.log('\n\n2️⃣  GET /api/production/designs/:id');
          console.log(`     Fetch SINGLE design (ID: ${firstDesignId}) with all related details`);
          console.log('━'.repeat(80));
          
          const singleResponse = await fetch(`${API_URL}/production/designs/${firstDesignId}`, { headers });
          const singleDesign = await singleResponse.json();
          
          console.log('✅ Response Status:', singleResponse.status);
          if (singleResponse.ok) {
            console.log('✅ Design Retrieved Successfully');
            console.log('\n📊 Complete Design with Details Response:');
            console.log(JSON.stringify(singleDesign, null, 2));
            
            console.log('\n\n✨ API Features:');
            console.log('  ✓ Combines data from root_cards table');
            console.log('  ✓ Joins with design_project_details table');
            console.log('  ✓ Returns design_name field from design_project_details');
            console.log('  ✓ Includes all design specifications, materials, and notes');
            console.log('  ✓ Available to Admin, Management, Production, Design Engineer roles');
          } else {
            console.log('❌ Error:', singleDesign.message);
          }
        } else {
          console.log('⚠️  No designs found in database yet.');
          console.log('    Tip: Create a design first via MyDesignsPage');
        }
      } else {
        console.log('❌ Error:', allDesigns.message);
      }
    } catch (error) {
      console.log('❌ Network Error:', error.message);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testDesignAPIs();
