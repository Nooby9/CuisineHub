import axios from 'axios';
import { googlePlacesApiKey } from '@env'; // Ensure that your API key is set up correctly

// Function to fetch place details from Google Places API
export const fetchPlaceDetails = async (place_id) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: place_id,
        key: googlePlacesApiKey,
        fields: 'name,rating,formatted_address,photos,types,geometry',
      },
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};
