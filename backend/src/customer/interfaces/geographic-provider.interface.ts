import {
  DestinationSearchQueryDto,
  DestinationResultDto,
} from '../dto/destination-search.dto';

export interface GeographicProvider {
  search(queryDto: DestinationSearchQueryDto): Promise<DestinationResultDto[]>;
}
