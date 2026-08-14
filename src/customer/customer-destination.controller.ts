import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerDestinationService } from './customer-destination.service';
import {
  DestinationSearchQueryDto,
  DestinationResultDto,
} from './dto/destination-search.dto';

@Controller('customer/destinations')
export class CustomerDestinationController {
  constructor(
    private readonly customerDestinationService: CustomerDestinationService,
  ) {}

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Query() queryDto: DestinationSearchQueryDto,
  ): Promise<DestinationResultDto[]> {
    return this.customerDestinationService.searchDestinations(queryDto);
  }
}
