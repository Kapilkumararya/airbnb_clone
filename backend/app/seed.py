from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import engine, SessionLocal
from app.models import Base, User, Listing, ListingImage, Amenity, ListingAmenity, Booking, Review, Favorite
from app.auth import get_password_hash

def seed_db():
    print("Dropping existing tables and recreating schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    try:
        print("Seeding demo users...")
        dummy_user = User(
            name="Demo Invigilator (Dummy Account)", 
            email="invigilator@airbnb.com", 
            hashed_password=get_password_hash("demo123"), 
            role="host",
            avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        )

        host1 = User(
            name="Aarav Mehta", 
            email="host@airbnb.com", 
            hashed_password=get_password_hash("host123"), 
            role="host",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        )
        host2 = User(
            name="Priya Patel", 
            email="priya@airbnb.com", 
            hashed_password=get_password_hash("host123"), 
            role="host",
            avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
        )
        host3 = User(
            name="Rohan Verma", 
            email="rohan@airbnb.com", 
            hashed_password=get_password_hash("host123"), 
            role="host",
            avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
        )
        
        guest1 = User(
            name="Kunal Sharma", 
            email="guest@airbnb.com", 
            hashed_password=get_password_hash("guest123"), 
            role="guest",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        )
        guest2 = User(
            name="Ananya Roy", 
            email="ananya@airbnb.com", 
            hashed_password=get_password_hash("guest123"), 
            role="guest",
            avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
        )
        
        db.add_all([dummy_user, host1, host2, host3, guest1, guest2])
        db.commit()
        db.refresh(dummy_user)
        db.refresh(host1)
        db.refresh(host2)
        db.refresh(host3)
        db.refresh(guest1)
        db.refresh(guest2)

        print("Seeding amenities...")
        amenities_data = [
            "Fast Wifi", "Private Pool", "Fully Equipped Kitchen", "Free Parking",
            "Air Conditioning", "Beachfront Access", "Panoramic Mountain View",
            "Dedicated Workspace", "Hot Tub", "BBQ Grill", "Smart TV with Netflix", "Power Backup",
            "Lake View", "Balcony", "Garden View", "Elevator", "Breakfast Included"
        ]
        amenity_objs = {}
        for name in amenities_data:
            a = Amenity(name=name)
            db.add(a)
            db.commit()
            db.refresh(a)
            amenity_objs[name] = a

        print("Seeding comprehensive destination listings...")
        listings_data = [
            # 1. NORTH GOA
            {
                "host_id": dummy_user.id,
                "title": "Luxury Beachfront Villa with Private Infinity Pool",
                "description": "Escape to this private sanctuary right on the sandy shores of Anjuna. Floor-to-ceiling glass doors open to panoramic Arabian Sea sunsets, lush private gardens, and an infinity pool. Dedicated chef and concierge included.",
                "location": "North Goa, India",
                "price_per_night": 18500,
                "property_type": "Beachfront",
                "max_guests": 8,
                "rating": 4.98,
                "review_count": 142,
                "images": [
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Private Pool", "Beachfront Access", "Free Parking", "Air Conditioning", "BBQ Grill"]
            },
            {
                "host_id": host2.id,
                "title": "Portuguese Heritage Villa with Tropical Garden",
                "description": "Restored 150-year-old Indo-Portuguese estate surrounded by swaying coconut palms in Vagator. Features high wooden ceilings, hand-painted tiles, and a shaded outdoor verandah.",
                "location": "North Goa, Goa",
                "price_per_night": 11000,
                "property_type": "Mansions",
                "max_guests": 6,
                "rating": 4.92,
                "review_count": 87,
                "images": [
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Free Parking", "Fully Equipped Kitchen", "Power Backup"]
            },
            {
                "host_id": host3.id,
                "title": "Bohemian Sunset Cottage Steps from Candolim Waves",
                "description": "Cozy seaside wooden cottage with private hammock deck, warm teak interiors, and direct barefoot access to golden beach sands.",
                "location": "North Goa, Goa",
                "price_per_night": 6500,
                "property_type": "Beachfront",
                "max_guests": 3,
                "rating": 4.88,
                "review_count": 64,
                "images": [
                    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Beachfront Access", "Air Conditioning", "Balcony"]
            },

            # 2. NEW DELHI
            {
                "host_id": dummy_user.id,
                "title": "Modern Penthouse with View of Lotus Temple",
                "description": "Breathtaking top-floor penthouse in South Delhi with floor-to-ceiling glass windows, landscaped private terrace garden, and designer modern furnishings.",
                "location": "New Delhi, Delhi",
                "price_per_night": 9500,
                "property_type": "Iconic cities",
                "max_guests": 5,
                "rating": 4.96,
                "review_count": 118,
                "images": [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Dedicated Workspace", "Elevator", "Power Backup"]
            },
            {
                "host_id": host2.id,
                "title": "Heritage Haveli Suite in Hauz Khas Village",
                "description": "Overlooking the historic 13th-century Hauz Khas reservoir and deer park. Traditional sandstone arches, brass lanterns, and steps away from art cafes.",
                "location": "New Delhi, Delhi",
                "price_per_night": 6800,
                "property_type": "Rooms",
                "max_guests": 2,
                "rating": 4.93,
                "review_count": 92,
                "images": [
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Balcony", "Breakfast Included"]
            },
            {
                "host_id": host3.id,
                "title": "Colonial Style Garden Bungalow in Civil Lines",
                "description": "Sprawling British-era bungalow with manicured lawns, wrap-around verandas, and high ceilings. Peaceful retreat in central Delhi.",
                "location": "New Delhi, Delhi",
                "price_per_night": 14200,
                "property_type": "Mansions",
                "max_guests": 8,
                "rating": 4.97,
                "review_count": 76,
                "images": [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Free Parking", "Air Conditioning", "Garden View", "Fully Equipped Kitchen"]
            },
            {
                "host_id": host1.id,
                "title": "Chic Designer Studio near Connaught Place",
                "description": "Minimalist urban oasis right in the heart of Delhi. Steps to metro, historic bazaars, museums, and premier culinary hotspots.",
                "location": "New Delhi, Delhi",
                "price_per_night": 4500,
                "property_type": "Iconic cities",
                "max_guests": 2,
                "rating": 4.89,
                "review_count": 134,
                "images": [
                    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Dedicated Workspace", "Elevator"]
            },

            # 3. MUMBAI
            {
                "host_id": dummy_user.id,
                "title": "Sea-Facing Luxury Apartment on Marine Drive",
                "description": "Uninterrupted sweeping panoramas of Queen's Necklace and the Arabian Sea. Watch gentle waves and golden sunsets from your private balcony.",
                "location": "Mumbai, Maharashtra",
                "price_per_night": 19500,
                "property_type": "Luxe",
                "max_guests": 4,
                "rating": 4.99,
                "review_count": 156,
                "images": [
                    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Elevator", "Balcony", "Smart TV with Netflix"]
            },
            {
                "host_id": host3.id,
                "title": "Chic Art Deco Loft in Bandra West",
                "description": "Located in Mumbai's trendiest cultural quarter with cafes, boutiques, and seaside promenades just around the corner.",
                "location": "Mumbai, Maharashtra",
                "price_per_night": 11800,
                "property_type": "Trending",
                "max_guests": 4,
                "rating": 4.94,
                "review_count": 102,
                "images": [
                    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Dedicated Workspace", "Fully Equipped Kitchen"]
            },
            {
                "host_id": host1.id,
                "title": "Contemporary Sunlit Flat in Santacruz East",
                "description": "Spacious and cozy 2-bedroom home conveniently located near BKC and the airport. Features plush king beds and high-speed fiber internet.",
                "location": "Mumbai, Maharashtra",
                "price_per_night": 8900,
                "property_type": "Iconic cities",
                "max_guests": 4,
                "rating": 4.86,
                "review_count": 81,
                "images": [
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Free Parking", "Elevator", "Power Backup"]
            },

            # 4. VARANASI
            {
                "host_id": host2.id,
                "title": "Riverfront Heritage Kothi Overlooking Assi Ghat",
                "description": "Step out directly onto the sacred stone steps of Assi Ghat. Watch sunrise Ganga Aarti from your private terrace with morning chai.",
                "location": "Varanasi, Uttar Pradesh",
                "price_per_night": 7200,
                "property_type": "Historic homes",
                "max_guests": 4,
                "rating": 4.97,
                "review_count": 140,
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Balcony", "Breakfast Included", "Power Backup"]
            },
            {
                "host_id": host3.id,
                "title": "Spiritual Ganges View Haveli with Private Sun Deck",
                "description": "Centuries-old stone residence renovated with modern comforts. Panoramic 180-degree views of the holy river and traditional wooden rowboats.",
                "location": "Varanasi, Uttar Pradesh",
                "price_per_night": 8500,
                "property_type": "Amazing views",
                "max_guests": 5,
                "rating": 4.95,
                "review_count": 112,
                "images": [
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Dedicated Workspace", "Balcony"]
            },
            {
                "host_id": host1.id,
                "title": "Serene Courtyard Retreat near Dashashwamedh Ghat",
                "description": "Peaceful oasis tucked away in the old city alleys. Features quiet inner courtyard with ancient neem tree and brass swing.",
                "location": "Varanasi, Uttar Pradesh",
                "price_per_night": 4800,
                "property_type": "Rooms",
                "max_guests": 2,
                "rating": 4.91,
                "review_count": 78,
                "images": [
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Breakfast Included"]
            },

            # 5. BHOPAL
            {
                "host_id": host1.id,
                "title": "Lake View Luxury Villa Overlooking Upper Lake",
                "description": "Wake up to serene blue waters and migrating birds. Expansive infinity lawn, floor-to-ceiling glass living room, and private open terrace.",
                "location": "Bhopal, Madhya Pradesh",
                "price_per_night": 8200,
                "property_type": "Amazing views",
                "max_guests": 6,
                "rating": 4.96,
                "review_count": 94,
                "images": [
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Lake View", "Free Parking", "Air Conditioning", "BBQ Grill"]
            },
            {
                "host_id": host2.id,
                "title": "Colonial Heritage Bungalow in Arera Colony",
                "description": "Nestled in Bhopal's greenest residential avenue. High ceilings, teak antique furniture, library, and peaceful shaded patio.",
                "location": "Bhopal, Madhya Pradesh",
                "price_per_night": 6500,
                "property_type": "Mansions",
                "max_guests": 5,
                "rating": 4.92,
                "review_count": 68,
                "images": [
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Free Parking", "Air Conditioning", "Garden View"]
            },
            {
                "host_id": host3.id,
                "title": "Serene Eco-Resort Cottage with Organic Orchards",
                "description": "Charming stone cottage set on 5 acres of organic mango orchards on the city outskirts. Great for stargazing and weekend relaxation.",
                "location": "Bhopal, Madhya Pradesh",
                "price_per_night": 5100,
                "property_type": "Countryside",
                "max_guests": 3,
                "rating": 4.88,
                "review_count": 52,
                "images": [
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Free Parking", "BBQ Grill", "Garden View"]
            },

            # 6. JAIPUR
            {
                "host_id": host1.id,
                "title": "Heritage Haveli with Courtyard & Private Rooftop",
                "description": "Step into royal Rajasthan history. Meticulously restored 18th-century Haveli with hand-painted frescoes and a rooftop overlooking City Palace.",
                "location": "Jaipur, Rajasthan",
                "price_per_night": 11400,
                "property_type": "Mansions",
                "max_guests": 6,
                "rating": 4.99,
                "review_count": 215,
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Free Parking", "Fully Equipped Kitchen", "Smart TV with Netflix"]
            },
            {
                "host_id": host2.id,
                "title": "Royal Rajputana Villa with Peacock Garden",
                "description": "Traditional stone arches, grand chandeliers, and peacocks visiting your breakfast courtyard every morning.",
                "location": "Jaipur, Rajasthan",
                "price_per_night": 15000,
                "property_type": "Luxe",
                "max_guests": 8,
                "rating": 4.96,
                "review_count": 89,
                "images": [
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Private Pool", "Air Conditioning", "Garden View", "Free Parking"]
            },

            # 7. MANALI
            {
                "host_id": host2.id,
                "title": "Cedar Wood Chalet with Himalayan Panoramic Views",
                "description": "Perched on a serene hill in Old Manali, this handcrafted cedar cabin features a cozy stone fireplace and 360-degree snowcapped mountain views.",
                "location": "Manali, Himachal Pradesh",
                "price_per_night": 6200,
                "property_type": "Cabins",
                "max_guests": 4,
                "rating": 4.95,
                "review_count": 98,
                "images": [
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Panoramic Mountain View", "Dedicated Workspace", "Free Parking", "Power Backup"]
            },
            {
                "host_id": host3.id,
                "title": "Apple Orchard Log Cabin with Fireplace",
                "description": "Rustic pine cabin surrounded by flowering apple orchards. Unplug in nature with wood stove warmth and alpine views.",
                "location": "Manali, Himachal Pradesh",
                "price_per_night": 5500,
                "property_type": "Cabins",
                "max_guests": 4,
                "rating": 4.91,
                "review_count": 73,
                "images": [
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Panoramic Mountain View", "Free Parking"]
            },

            # 8. UDAIPUR
            {
                "host_id": host1.id,
                "title": "Palatial Waterfront Villa Overlooking Lake Pichola",
                "description": "Stunning white stone architecture with unobstructed views of Jag Mandir and the Lake Palace. Comes with a heated plunge pool and sunset terrace.",
                "location": "Udaipur, Rajasthan",
                "price_per_night": 24000,
                "property_type": "Luxe",
                "max_guests": 6,
                "rating": 5.0,
                "review_count": 78,
                "images": [
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Private Pool", "Fast Wifi", "Air Conditioning", "Hot Tub", "Free Parking"]
            },
            {
                "host_id": host2.id,
                "title": "Royal Mewar Lakefront Suite with Rooftop Jharokhas",
                "description": "Traditional carved stone balcony perched right above the shimmering waters. Ideal for romantic sunsets and serene dinners.",
                "location": "Udaipur, Rajasthan",
                "price_per_night": 13500,
                "property_type": "Amazing views",
                "max_guests": 3,
                "rating": 4.97,
                "review_count": 82,
                "images": [
                    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Lake View", "Air Conditioning", "Balcony"]
            },

            # 9. MUNNAR & KERALA
            {
                "host_id": host2.id,
                "title": "Secluded Glass Treehouse in Mist-Covered Tea Estate",
                "description": "Suspended among towering cardamom and silver oak trees in Munnar. Enjoy sweeping vistas of lush emerald tea plantations.",
                "location": "Munnar, Kerala",
                "price_per_night": 8900,
                "property_type": "Amazing views",
                "max_guests": 2,
                "rating": 4.97,
                "review_count": 184,
                "images": [
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Panoramic Mountain View", "Dedicated Workspace", "Free Parking"]
            },
            {
                "host_id": host1.id,
                "title": "Private Island Estate with Coconut Grove",
                "description": "Your own private emerald island accessible exclusively by private traditional shikara boat on Vembanad Lake.",
                "location": "Kumarakom, Kerala",
                "price_per_night": 27500,
                "property_type": "Islands",
                "max_guests": 10,
                "rating": 5.0,
                "review_count": 52,
                "images": [
                    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Private Pool", "Fast Wifi", "Air Conditioning", "Hot Tub", "Free Parking"]
            },

            # 10. BENGALURU
            {
                "host_id": host3.id,
                "title": "Sunlit Penthouse with Garden Terrace in Indiranagar",
                "description": "Green rooftop terrace filled with tropical ferns and monsteras. Minutes from Bangalore's best specialty coffee roasters and breweries.",
                "location": "Bengaluru, Karnataka",
                "price_per_night": 7800,
                "property_type": "Trending",
                "max_guests": 4,
                "rating": 4.94,
                "review_count": 91,
                "images": [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Air Conditioning", "Dedicated Workspace", "Balcony"]
            },
            {
                "host_id": host1.id,
                "title": "Industrial Loft with Private Balcony in Koramangala",
                "description": "Double-height ceilings, exposed brick walls, and custom steel fixtures. Perfect for creative professionals and digital nomads.",
                "location": "Bengaluru, Karnataka",
                "price_per_night": 6200,
                "property_type": "Iconic cities",
                "max_guests": 3,
                "rating": 4.90,
                "review_count": 67,
                "images": [
                    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Fast Wifi", "Dedicated Workspace", "Air Conditioning", "Elevator"]
            },

            # 11. ALIBAUG
            {
                "host_id": host2.id,
                "title": "Modern Minimalist Glass Villa with Private Lawn",
                "description": "Designed by award-winning architects, nestled in Alibaug's serene countryside. Open-air plunge pool, zen courtyard, and organic chef garden.",
                "location": "Alibaug, Maharashtra",
                "price_per_night": 14500,
                "property_type": "Trending",
                "max_guests": 6,
                "rating": 4.93,
                "review_count": 89,
                "images": [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                ],
                "amenities": ["Private Pool", "Fast Wifi", "Air Conditioning", "Fully Equipped Kitchen", "BBQ Grill"]
            }
        ]

        created_listings = []
        for l_data in listings_data:
            images = l_data.pop("images", [])
            amenities = l_data.pop("amenities", [])
            listing = Listing(**l_data)
            db.add(listing)
            db.commit()
            db.refresh(listing)
            created_listings.append(listing)

            for order, img_url in enumerate(images):
                img = ListingImage(listing_id=listing.id, image_url=img_url, display_order=order)
                db.add(img)

            for a_name in amenities:
                if a_name in amenity_objs:
                    link = ListingAmenity(listing_id=listing.id, amenity_id=amenity_objs[a_name].id)
                    db.add(link)
            db.commit()

        print(f"Created {len(created_listings)} listings across 11 key regions!")

        print("Seeding genuine user reviews...")
        reviews_data = [
            (created_listings[0].id, guest1.id, 5.0, "Absolute paradise! The sunset from the infinity pool was unreal and the private chef made exquisite seafood."),
            (created_listings[0].id, guest2.id, 4.9, "One of the best stays in North Goa. Spotless, quiet, and steps from the beach."),
            (created_listings[3].id, guest1.id, 5.0, "The Lotus Temple views at night are magical. Ultra modern and very comfortable."),
            (created_listings[7].id, guest2.id, 5.0, "Marine Drive sunrise views were unmatched. Perfect Mumbai experience."),
            (created_listings[10].id, guest1.id, 5.0, "Assi Ghat morning aarti from the terrace was unforgettable. Highly recommend!"),
            (created_listings[13].id, guest2.id, 5.0, "Bhopal's Upper Lake looks stunning from the lawn. Peace and luxury in one place."),
            (created_listings[16].id, guest1.id, 5.0, "Staying in this heritage haveli felt like traveling back in time in royal comfort."),
            (created_listings[18].id, guest2.id, 5.0, "Magical cedar fragrance, breathtaking snow views, and a roaring fireplace in Manali.")
        ]
        for lid, uid, score, txt in reviews_data:
            r = Review(listing_id=lid, user_id=uid, rating=score, comment=txt)
            db.add(r)
        db.commit()

        print("Seeding scattered bookings...")
        now = datetime.utcnow()
        # Seed only 3 upcoming bookings on specific listings (leaving 90%+ listings completely free on all dates)
        b1 = Booking(
            listing_id=created_listings[0].id,
            guest_id=guest1.id,
            check_in=now + timedelta(days=12),
            check_out=now + timedelta(days=15),
            guests=4,
            nightly_price=created_listings[0].price_per_night,
            cleaning_fee=4500,
            service_fee=6500,
            total_price=created_listings[0].price_per_night * 3 + 4500 + 6500,
            status="confirmed"
        )
        b2 = Booking(
            listing_id=created_listings[7].id,
            guest_id=guest2.id,
            check_in=now + timedelta(days=20),
            check_out=now + timedelta(days=24),
            guests=2,
            nightly_price=created_listings[7].price_per_night,
            cleaning_fee=3000,
            service_fee=4200,
            total_price=created_listings[7].price_per_night * 4 + 3000 + 4200,
            status="confirmed"
        )

        # Seed completed past stays for guest1 so review eligibility and past trips work properly
        b_past1 = Booking(
            listing_id=created_listings[0].id,
            guest_id=guest1.id,
            check_in=now - timedelta(days=20),
            check_out=now - timedelta(days=16),
            guests=2,
            nightly_price=created_listings[0].price_per_night,
            cleaning_fee=4500,
            service_fee=6500,
            total_price=created_listings[0].price_per_night * 4 + 4500 + 6500,
            status="confirmed"
        )
        b_past2 = Booking(
            listing_id=created_listings[3].id,
            guest_id=guest1.id,
            check_in=now - timedelta(days=35),
            check_out=now - timedelta(days=30),
            guests=2,
            nightly_price=created_listings[3].price_per_night,
            cleaning_fee=2500,
            service_fee=3500,
            total_price=created_listings[3].price_per_night * 5 + 2500 + 3500,
            status="confirmed"
        )

        # Seed 3 completed past bookings for the Demo Invigilator dummy account
        dummy_trip1 = Booking(
            listing_id=created_listings[16].id,  # Royal Heritage Haveli in Jaipur
            guest_id=dummy_user.id,
            check_in=now - timedelta(days=25),
            check_out=now - timedelta(days=20),
            guests=2,
            nightly_price=created_listings[16].price_per_night,
            cleaning_fee=2000,
            service_fee=3200,
            total_price=created_listings[16].price_per_night * 5 + 2000 + 3200,
            status="confirmed"
        )
        dummy_trip2 = Booking(
            listing_id=created_listings[18].id,  # Swiss Pine Chalet in Manali
            guest_id=dummy_user.id,
            check_in=now - timedelta(days=45),
            check_out=now - timedelta(days=40),
            guests=3,
            nightly_price=created_listings[18].price_per_night,
            cleaning_fee=2500,
            service_fee=3500,
            total_price=created_listings[18].price_per_night * 5 + 2500 + 3500,
            status="confirmed"
        )
        dummy_trip3 = Booking(
            listing_id=created_listings[10].id,  # Riverside Heritage Kothi in Varanasi
            guest_id=dummy_user.id,
            check_in=now - timedelta(days=65),
            check_out=now - timedelta(days=60),
            guests=2,
            nightly_price=created_listings[10].price_per_night,
            cleaning_fee=1800,
            service_fee=2800,
            total_price=created_listings[10].price_per_night * 5 + 1800 + 2800,
            status="confirmed"
        )

        db.add_all([b1, b2, b_past1, b_past2, dummy_trip1, dummy_trip2, dummy_trip3])
        db.commit()

        print(f"SUCCESS: Seeded {len(created_listings)} listings, {len(reviews_data)} reviews, and bookings across all places!")
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
