"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DestinationItem {
  name: string;
  type: string;
  query?: string;
  category?: string;
}

const INSPIRATION_DATA: Record<string, DestinationItem[]> = {
  'Popular': [
    { name: 'Goa', type: 'Beach villas & retreats', query: 'Goa' },
    { name: 'Manali', type: 'Cedar chalets & cabins', query: 'Manali' },
    { name: 'Jaipur', type: 'Heritage havelis & palaces', query: 'Jaipur' },
    { name: 'Udaipur', type: 'Lake palace stays', query: 'Udaipur' },
    { name: 'Munnar', type: 'Tea estate treehouses', query: 'Munnar' },
    { name: 'Alibaug', type: 'Modern glass villas', query: 'Alibaug' },
    { name: 'Shimla', type: 'Cottage rentals', query: 'Shimla' },
    { name: 'Rishikesh', type: 'Riverside retreats', query: 'Rishikesh' },
    { name: 'Kerala', type: 'Backwater & lake villas', query: 'Kerala' },
    { name: 'Lonavala', type: 'Private pool villas', query: 'Lonavala' },
    { name: 'Pondicherry', type: 'French villa rentals', query: 'Pondicherry' },
    { name: 'Ooty', type: 'Hilltop bungalows', query: 'Ooty' },
    { name: 'Coorg', type: 'Coffee estate stays', query: 'Coorg' },
    { name: 'Mussoorie', type: 'Valley view suites', query: 'Mussoorie' },
    { name: 'Gokarna', type: 'Seaside cottages', query: 'Gokarna' },
    { name: 'Darjeeling', type: 'Tea garden stays', query: 'Darjeeling' },
    { name: 'Varanasi', type: 'Heritage riverfront flats', query: 'Varanasi' },
    { name: 'Amritsar', type: 'Boutique homestays', query: 'Amritsar' },
    { name: 'Jodhpur', type: 'Blue city palaces', query: 'Jodhpur' },
    { name: 'Wayanad', type: 'Rainforest treehouses', query: 'Wayanad' },
    { name: 'Kodaikanal', type: 'Misty lake chalets', query: 'Kodaikanal' },
    { name: 'Nainital', type: 'Lakefront cottages', query: 'Nainital' },
    { name: 'Agra', type: 'Taj view homestays', query: 'Agra' },
    { name: 'Pushkar', type: 'Desert camp villas', query: 'Pushkar' },
  ],
  'Arts & culture': [
    { name: 'Jaipur', type: 'Palace & fresco stays', query: 'Jaipur', category: 'Mansions' },
    { name: 'Udaipur', type: 'Royal Mewar havelis', query: 'Udaipur', category: 'Luxe' },
    { name: 'Varanasi', type: 'Ghatside heritage suites', query: 'Varanasi' },
    { name: 'Hampi', type: 'Ancient ruins retreats', query: 'Hampi' },
    { name: 'Kochi', type: 'Biennale art residences', query: 'Kochi' },
    { name: 'Jodhpur', type: 'Mehrangarh view villas', query: 'Jodhpur' },
    { name: 'Mysore', type: 'Royal heritage suites', query: 'Mysore' },
    { name: 'Kolkata', type: 'Colonial heritage homes', query: 'Kolkata' },
    { name: 'Madurai', type: 'Temple architecture stays', query: 'Madurai' },
    { name: 'Delhi', type: 'Monument view apartments', query: 'Delhi' },
    { name: 'Khajuraho', type: 'Art & sculpture lodges', query: 'Khajuraho' },
    { name: 'Pondicherry', type: 'French quarter heritage', query: 'Pondicherry' },
    { name: 'Shekhawati', type: 'Fresco painted mansions', query: 'Shekhawati' },
    { name: 'Shantiniketan', type: 'Artistic retreat stays', query: 'Shantiniketan' },
    { name: 'Thanjavur', type: 'Chola heritage villas', query: 'Thanjavur' },
    { name: 'Lucknow', type: 'Nawabi culture suites', query: 'Lucknow' },
    { name: 'Bikaner', type: 'Desert fort homestays', query: 'Bikaner' },
    { name: 'Pushkar', type: 'Sacred lake havelis', query: 'Pushkar' },
  ],
  'Beach': [
    { name: 'North Goa', type: 'Beachfront luxury villas', query: 'Goa', category: 'Beachfront' },
    { name: 'South Goa', type: 'Serene coastal retreats', query: 'Goa', category: 'Beachfront' },
    { name: 'Alibaug', type: 'Private ocean pavilions', query: 'Alibaug', category: 'Beachfront' },
    { name: 'Gokarna', type: 'Om beach cliff cottages', query: 'Gokarna', category: 'Beachfront' },
    { name: 'Varkala', type: 'Cliffside sea chalets', query: 'Varkala', category: 'Beachfront' },
    { name: 'Pondicherry', type: 'Promenade seaside flats', query: 'Pondicherry', category: 'Beachfront' },
    { name: 'Kovalam', type: 'Lighthouse beachfront homes', query: 'Kovalam', category: 'Beachfront' },
    { name: 'Havelock', type: 'Coral island retreats', query: 'Havelock', category: 'Islands' },
    { name: 'Neil Island', type: 'Turquoise bay cabins', query: 'Neil Island', category: 'Islands' },
    { name: 'Daman', type: 'Portuguese seaside villas', query: 'Daman', category: 'Beachfront' },
    { name: 'Diu', type: 'Coastal fort suites', query: 'Diu', category: 'Beachfront' },
    { name: 'Bekal', type: 'Secluded beach estates', query: 'Bekal', category: 'Beachfront' },
    { name: 'Marari', type: 'Village palm chalets', query: 'Marari', category: 'Beachfront' },
    { name: 'Cherai', type: 'Lagoon & beach homes', query: 'Cherai', category: 'Beachfront' },
    { name: 'Puri', type: 'Golden sand beach flats', query: 'Puri', category: 'Beachfront' },
    { name: 'Mandarmani', type: 'Drive-in beach resorts', query: 'Mandarmani', category: 'Beachfront' },
    { name: 'Tarkarli', type: 'Scuba beach homestays', query: 'Tarkarli', category: 'Beachfront' },
    { name: 'Ganpatipule', type: 'Konkan coast retreats', query: 'Ganpatipule', category: 'Beachfront' },
  ],
  'Mountains': [
    { name: 'Manali', type: 'Snow peak cedar chalets', query: 'Manali', category: 'Cabins' },
    { name: 'Shimla', type: 'Colonial pine cottages', query: 'Shimla', category: 'Cabins' },
    { name: 'Munnar', type: 'Misty plantation lodges', query: 'Munnar', category: 'Amazing views' },
    { name: 'Leh Ladakh', type: 'High altitude retreats', query: 'Ladakh', category: 'Amazing views' },
    { name: 'Kasol', type: 'Pine valley log cabins', query: 'Kasol', category: 'Cabins' },
    { name: 'Dharamshala', type: 'Dhauladhar view suites', query: 'Dharamshala', category: 'Amazing views' },
    { name: 'Mussoorie', type: 'Himalayan sunrise villas', query: 'Mussoorie', category: 'Amazing views' },
    { name: 'Ooty', type: 'Nilgiri tea bungalows', query: 'Ooty', category: 'Cabins' },
    { name: 'Kodaikanal', type: 'Misty forest chalets', query: 'Kodaikanal', category: 'Cabins' },
    { name: 'Gulmarg', type: 'Ski slope alpine chalets', query: 'Gulmarg', category: 'Cabins' },
    { name: 'Pahalgam', type: 'Pine meadow river cabins', query: 'Pahalgam', category: 'Cabins' },
    { name: 'Spiti Valley', type: 'Stargazing stone homes', query: 'Spiti', category: 'Amazing views' },
    { name: 'Auli', type: 'Snow panoramic lodges', query: 'Auli', category: 'Amazing views' },
    { name: 'Gangtok', type: 'Kanchenjunga view stays', query: 'Gangtok', category: 'Amazing views' },
    { name: 'Dalhousie', type: 'Colonial mountain homes', query: 'Dalhousie', category: 'Cabins' },
    { name: 'Pelling', type: 'Monastery valley lodges', query: 'Pelling', category: 'Amazing views' },
    { name: 'Kalimpong', type: 'Cloud valley homestays', query: 'Kalimpong', category: 'Cabins' },
    { name: 'Tawang', type: 'Alpine mountain cabins', query: 'Tawang', category: 'Amazing views' },
  ],
  'Outdoors': [
    { name: 'Rishikesh', type: 'River rafting eco-lodges', query: 'Rishikesh', category: 'Trending' },
    { name: 'Jim Corbett', type: 'Jungle wilderness stays', query: 'Corbett', category: 'Cabins' },
    { name: 'Ranthambore', type: 'Tiger safari luxury tents', query: 'Ranthambore', category: 'Luxe' },
    { name: 'Bir Billing', type: 'Paragliding valley stays', query: 'Bir', category: 'Amazing views' },
    { name: 'Coorg', type: 'Coffee estate canopy cabins', query: 'Coorg', category: 'Cabins' },
    { name: 'Wayanad', type: 'Rainforest canopy retreats', query: 'Wayanad', category: 'Amazing views' },
    { name: 'Dandeli', type: 'River safari eco-lodges', query: 'Dandeli', category: 'Cabins' },
    { name: 'Kabini', type: 'Backwater safari villas', query: 'Kabini', category: 'Luxe' },
    { name: 'Jaisalmer', type: 'Thar desert glamping', query: 'Jaisalmer', category: 'Trending' },
    { name: 'Kanha', type: 'National park forest huts', query: 'Kanha', category: 'Cabins' },
    { name: 'Bandhavgarh', type: 'Wilderness treehouse suites', query: 'Bandhavgarh', category: 'OMG!' },
    { name: 'Kaziranga', type: 'Rhino reserve eco stays', query: 'Kaziranga', category: 'Cabins' },
    { name: 'Gir Forest', type: 'Lion sanctuary cottages', query: 'Gir', category: 'Cabins' },
    { name: 'Pangong Lake', type: 'Lakeside luxury tents', query: 'Pangong', category: 'Amazing views' },
    { name: 'Ziro Valley', type: 'Pine valley organic camps', query: 'Ziro', category: 'Cabins' },
    { name: 'Sundarbans', type: 'Mangrove water retreats', query: 'Sundarbans', category: 'Islands' },
  ],
  'Things to do': [
    { name: 'Scuba Diving', type: 'Goa & Andaman reef stays', query: 'Goa', category: 'Beachfront' },
    { name: 'Ayurvedic Wellness', type: 'Kerala rejuvenation retreats', query: 'Kerala', category: 'Luxe' },
    { name: 'Himalayan Trekking', type: 'Manali alpine basecamps', query: 'Manali', category: 'Cabins' },
    { name: 'Heritage Walks', type: 'Jaipur royal palace tours', query: 'Jaipur', category: 'Mansions' },
    { name: 'Yoga & Meditation', type: 'Rishikesh spiritual ashrams', query: 'Rishikesh', category: 'Trending' },
    { name: 'Wildlife Safaris', type: 'Corbett tiger tracking', query: 'Corbett', category: 'Cabins' },
    { name: 'Desert Dune Safari', type: 'Jaisalmer camel glamping', query: 'Jaisalmer', category: 'Trending' },
    { name: 'Houseboat Cruises', type: 'Alleppey lake voyages', query: 'Kerala', category: 'Islands' },
    { name: 'Paragliding', type: 'Bir Billing glider lodges', query: 'Bir', category: 'Amazing views' },
    { name: 'Surfing Stays', type: 'Konkan coast surf camps', query: 'Goa', category: 'Beachfront' },
    { name: 'Vineyard Tasting', type: 'Nashik boutique wine villas', query: 'Alibaug', category: 'Luxe' },
    { name: 'Tea Plantation Tours', type: 'Munnar & Darjeeling estates', query: 'Munnar', category: 'Amazing views' },
    { name: 'Dark Sky Stargazing', type: 'Spiti & Ladakh observatories', query: 'Ladakh', category: 'Amazing views' },
    { name: 'Skiing & Snowboarding', type: 'Gulmarg & Auli ski resorts', query: 'Manali', category: 'Cabins' },
    { name: 'Coffee Harvesting', type: 'Chikmagalur & Coorg trails', query: 'Coorg', category: 'Cabins' },
    { name: 'Pottery & Craft Tours', type: 'Rajasthan artisan stays', query: 'Jaipur', category: 'Mansions' },
  ]
};

export default function InspirationSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('Popular');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const tabs = Object.keys(INSPIRATION_DATA);
  const items = INSPIRATION_DATA[activeTab] || [];
  
  // Show first 17 items if collapsed, or all items if expanded
  const visibleItems = isExpanded ? items : items.slice(0, 17);

  const handleDestinationClick = (item: DestinationItem) => {
    const params = new URLSearchParams();
    if (item.query) {
      params.set('location', item.query);
    } else {
      params.set('location', item.name);
    }
    if (item.category) {
      params.set('category', item.category);
    }

    router.push(`/?${params.toString()}`);
    // Smoothly scroll up to the top to see the filtered listings
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-24 pt-12 border-t border-neutral-200">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222] mb-6">
        Inspiration for future getaways
      </h2>

      {/* Tabs Row */}
      <div className="flex gap-6 border-b border-neutral-200 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setIsExpanded(false);
              }}
              className={`pb-4 text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'text-[#222222] border-b-2 border-[#222222]'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
        {visibleItems.map((loc, idx) => (
          <div
            key={`${loc.name}-${idx}`}
            onClick={() => handleDestinationClick(loc)}
            className="group cursor-pointer select-none"
          >
            <div className="text-sm font-semibold text-[#222222] group-hover:underline">
              {loc.name}
            </div>
            <div className="text-sm text-neutral-500">
              {loc.type}
            </div>
          </div>
        ))}

        {/* Show More / Show Less Toggle Button */}
        {items.length > 17 && (
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:text-black cursor-pointer select-none group pt-1"
          >
            <span className="group-hover:underline">
              {isExpanded ? 'Show less' : 'Show more'}
            </span>
            <svg
              className={`w-4 h-4 text-neutral-800 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
