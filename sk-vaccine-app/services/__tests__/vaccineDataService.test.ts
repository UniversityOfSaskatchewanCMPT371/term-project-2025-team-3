import logger from "@/utils/logger";
import test1Data from "@/services/__tests__/vaccineDataServiceTest1.data.json"
import { VaccineDataService } from "../vaccineDataService"



describe('Unit tests for VaccineDataService.getVaccineSheetJSON', () => {

    it('ensure proper JSON is retrieved for each product id', async () => {
        const mockIDs = [11766, 31990, 11767]
        const vaccineservice = new VaccineDataService();    
        
        // Cast 'as any' to allow for accessing private methods
        jest.spyOn(vaccineservice as any, "getProductIDs").mockReturnValue(mockIDs);    
    
        const result = await vaccineservice.getVaccineSheetJSON();
        
        expect(result).toEqual(test1Data);
    })

    it('Ensure null value is caught and does not cause issue', async () => {
        const mockIDs = [11766, 12848342, 31990, 11767]
        const vaccineservice = new VaccineDataService();    
        
        // Cast 'as any' to allow for accessing private methods
        jest.spyOn(vaccineservice as any, "getProductIDs").mockReturnValue(mockIDs);    
    
        const result = await vaccineservice.getVaccineSheetJSON();
        
        expect(result).toEqual(test1Data);
    })

})