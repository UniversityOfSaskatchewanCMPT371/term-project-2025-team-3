import { renderHook, waitFor } from '@testing-library/react-native';
import useLocation from '../locationData';
import logger from '@/utils/logger';
import { LocationAccessError } from '@/services/locationDataService';


const mockLocationService = {
    isEnabled: jest.fn(),
    requestPermission: jest.fn(),
    getLocation: jest.fn()
};

beforeEach(() => {
    jest.clearAllMocks();

});



describe('Unit tests for useLocation', () => {
    
    it('location is enabled and returns a location', async () => {
        mockLocationService.isEnabled.mockResolvedValue(true);
        mockLocationService.getLocation.mockResolvedValue([42, -71]);
        mockLocationService.requestPermission.mockResolvedValue(true);


        const { result } = renderHook(() => useLocation(mockLocationService));


        // check if the hook starts loading
        expect(result.current.loading).toBe(true);
        
        // wait for it to stop loading
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeNull();
        expect(result.current.isEnabled).toBeTruthy();
        expect(result.current.location).toEqual([42, -71]);

    });

    it('location is disabled, and request permission fails', async () => {
        mockLocationService.isEnabled.mockResolvedValue(false);
        mockLocationService.getLocation = jest.fn(() => {
            throw new LocationAccessError("Cannot access user's location");
        });
        mockLocationService.requestPermission.mockResolvedValue(false);


        const { result } = renderHook(() => useLocation(mockLocationService));


        // check if the hook starts loading
        expect(result.current.loading).toBe(true);
        
        // wait for it to stop loading
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toEqual("location access disabled");
        expect(result.current.isEnabled).toBe(false);
        expect(result.current.location).toBeNull();

    });



    it('location is enabled and location returns an error', async () => {
        mockLocationService.isEnabled.mockResolvedValue(true);
        mockLocationService.getLocation = jest.fn(() => {
            throw new LocationAccessError("Cannot access user's location");
        });
        mockLocationService.requestPermission.mockResolvedValue(false);


        const { result } = renderHook(() => useLocation(mockLocationService));


        // check if the hook starts loading
        expect(result.current.loading).toBe(true);
        
        // wait for it to stop loading
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toEqual("Cannot access user's location");
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.location).toBeNull();

    });





    it('location is disabled, but user enables it on request', async () => {
        mockLocationService.isEnabled.mockResolvedValue(false);
        mockLocationService.getLocation.mockResolvedValue([42, -71]);
        mockLocationService.requestPermission.mockResolvedValue(true);


        const { result } = renderHook(() => useLocation(mockLocationService));


        // check if the hook starts loading
        expect(result.current.loading).toBe(true);
        
        // wait for it to stop loading
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeNull();
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.location).toEqual([42, -71]);

    });


    it('location is disabled, request permission succeeds and location returns an error', async () => {
        mockLocationService.isEnabled.mockResolvedValue(false);
        mockLocationService.getLocation = jest.fn(() => {
            throw new LocationAccessError("Cannot access user's location");
        });
        mockLocationService.requestPermission.mockResolvedValue(true);


        const { result } = renderHook(() => useLocation(mockLocationService));


        // check if the hook starts loading
        expect(result.current.loading).toBe(true);
        
        // wait for it to stop loading
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toEqual("Cannot access user's location");
        expect(result.current.isEnabled).toEqual(true);
        expect(result.current.location).toBeNull();

    });


});