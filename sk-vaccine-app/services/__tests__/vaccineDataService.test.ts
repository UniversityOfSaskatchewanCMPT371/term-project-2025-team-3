import logger from "@/utils/logger";
import test1Data from "@/services/__tests__/vaccineDataServiceTest1.data.json"
import { VaccineDataService } from "../vaccineDataService" 




// mock VaccineEntity
jest.mock("@/myorm/vaccine-entity", () => {

    const actualModule = jest.requireActual("@/myorm/base-entity");
    
    class MockVaccineEntity extends actualModule.default{
      static find = jest.fn();
      static count = jest.fn();
      static clear = jest.fn();
      static queryObjs = jest.fn();
      static getColumns = jest.fn();
      save = jest.fn();
  
    }
  
  
    return {
      __esModule: true,
      ...actualModule,
      default: MockVaccineEntity,
    };
  });


describe('Unit tests for VaccineData', () => {

    let vaccineDataService: VaccineDataService;

    beforeEach(() => {
       vaccineDataService = new VaccineDataService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe.skip('Unit tests for VaccineDataService.getVaccineSheetJSON', () => {

        it('ensure proper JSON is retrieved for each product id', async () => {
            const mockIDs = [11766, 31990, 11767]
               
            // Cast 'as any' to allow for accessing private methods
            jest.spyOn(vaccineDataService as any, "getProductIDs").mockReturnValue(mockIDs);    
        
            const result = await vaccineDataService.getVaccineJSONSHA();
            
            expect(result).toEqual(test1Data);
        })
    
        it('Ensure null value is caught and does not cause issue', async () => {
            const mockIDs = [11766, 12848342, 31990, 11767]
            
            // Cast 'as any' to allow for accessing private methods
            jest.spyOn(vaccineDataService as any, "getProductIDs").mockReturnValue(mockIDs);    
        
            const result = await vaccineDataService.getVaccineJSONSHA();
            
            expect(result).toEqual(test1Data);
        })
    
    })

})




