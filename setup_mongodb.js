import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (parts) {
          const key = parts[1];
          let value = parts[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (err) {
    console.error("Error reading .env file:", err);
  }
}

loadEnv();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("Error: MONGO_URI is not configured in .env file.");
  process.exit(1);
}

// Initial seed datasets
const MOCK_VENUES = [
  {
    stadium_name: "AT&T Stadium",
    city: "Dallas",
    gates: [
      { name: "Gate A", location: { type: "Point", coordinates: [-97.0955, 32.7483] } },
      { name: "Gate B", location: { type: "Point", coordinates: [-97.0935, 32.7463] } }
    ],
    food_options: [
      {
        name: "Cowboy Grill",
        dietary_tags: ["halal"],
        popular_items: ["Double Cheeseburger", "Brisket Sandwich"],
        menu_description: "Premium beef burgers, smoked brisket, loaded fries, cold sodas."
      },
      {
        name: "Lone Star Veg",
        dietary_tags: ["vegan", "gluten-free"],
        popular_items: ["Vegan Chilli Dog", "Nachos"],
        menu_description: "Plant-based hot dogs, vegan cheese nachos, gluten-free snacks."
      }
    ]
  },
  {
    stadium_name: "SoFi Stadium",
    city: "Inglewood",
    gates: [
      { name: "Gate 1", location: { type: "Point", coordinates: [-118.3400, 33.9540] } },
      { name: "Gate 2", location: { type: "Point", coordinates: [-118.3380, 33.9530] } }
    ],
    food_options: [
      {
        name: "LA Tacos & Co",
        dietary_tags: ["vegan", "gluten-free", "halal"],
        popular_items: ["Avocado Asada Taco", "Cilantro Rice Bowl"],
        menu_description: "Authentic LA style tacos with house salsa, vegan options, fresh corn tortillas."
      }
    ]
  },
  {
    stadium_name: "MetLife Stadium",
    city: "East Rutherford",
    gates: [
      { name: "Pepsi Gate", location: { type: "Point", coordinates: [-74.0750, 40.8140] } },
      { name: "Verizon Gate", location: { type: "Point", coordinates: [-74.0735, 40.8130] } }
    ],
    food_options: [
      {
        name: "Jersey Deli",
        dietary_tags: ["vegetarian"],
        popular_items: ["Mozzarella Sticks", "Pretzels"],
        menu_description: "Traditional local deli snacks, hot soft pretzels, cheese curds."
      }
    ]
  }
];

const MOCK_CROWD = {
  "AT&T Stadium": {
    "Gate A": { density_score: 0.72, waiting_time: 25 },
    "Gate B": { density_score: 0.15, waiting_time: 4 }
  },
  "SoFi Stadium": {
    "Gate 1": { density_score: 0.35, waiting_time: 8 },
    "Gate 2": { density_score: 0.65, waiting_time: 18 }
  },
  "MetLife Stadium": {
    "Pepsi Gate": { density_score: 0.90, waiting_time: 45 },
    "Verizon Gate": { density_score: 0.40, waiting_time: 12 }
  }
};

async function seedDatabase() {
  const maskedUri = uri.includes('@') ? uri.split('@').slice(-1)[0] : uri;
  console.log(`Connecting to MongoDB Atlas Cluster (${maskedUri})...`);
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully. Seeding database 'worldcup_fan_agent'...");
    
    const db = client.db("worldcup_fan_agent");
    
    // Clear collections first
    console.log("Dropping existing 'venues' and 'crowd_live' collections if they exist...");
    try {
      await db.collection("venues").drop();
      await db.collection("crowd_live").drop();
      console.log("Collections dropped successfully.");
    } catch (e) {
      console.log("Collections did not exist; proceeding to seed directly.");
    }
    
    // Seed venues
    console.log("Inserting venues...");
    const venueResult = await db.collection("venues").insertMany(MOCK_VENUES);
    console.log(`Successfully inserted ${venueResult.insertedCount} venues.`);
    
    // Seed crowd telemetry
    console.log("Inserting live crowd status records...");
    let telemetryCount = 0;
    for (const [stadiumName, gates] of Object.entries(MOCK_CROWD)) {
      const venue = await db.collection("venues").findOne({ stadium_name: stadiumName });
      if (venue) {
        for (const [gateName, data] of Object.entries(gates)) {
          await db.collection("crowd_live").insertOne({
            venue_id: venue._id,
            gate: gateName,
            density_score: data.density_score,
            waiting_time: data.waiting_time,
            timestamp: new Date()
          });
          telemetryCount++;
        }
      }
    }
    console.log(`Successfully seeded ${telemetryCount} crowd telemetry records.`);
    console.log("=========================================");
    console.log("Database seed completed successfully!");
    console.log("=========================================");
  } catch (err) {
    console.error("Error during database seed execution:", err);
  } finally {
    await client.close();
  }
}

seedDatabase();
