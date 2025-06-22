import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { StreamingPlatformsService } from './streaming-platform.service';
import { CreateStreamingPlatformDto } from './dto/create-streaming-platform.dto';
import { UpdateStreamingPlatformDto } from './dto/update-streaming-platform.dto';

@Controller('streaming-platforms')
export class StreamingPlatformsController {
  constructor(
    private readonly streamingPlatformsService: StreamingPlatformsService,
  ) {}

  @Post()
  async create(@Body() createStreamingPlatformDto: CreateStreamingPlatformDto) {
    return this.streamingPlatformsService.create(createStreamingPlatformDto);
  }

  @Get()
  async findAll(
    @Query('activeOnly', new ParseBoolPipe({ optional: true }))
    activeOnly?: boolean,
  ) {
    return this.streamingPlatformsService.findAll(activeOnly);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.streamingPlatformsService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.streamingPlatformsService.findByCode(code);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStreamingPlatformDto: UpdateStreamingPlatformDto,
  ) {
    return this.streamingPlatformsService.update(
      id,
      updateStreamingPlatformDto,
    );
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.streamingPlatformsService.toggleActive(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.streamingPlatformsService.remove(id);
  }
}
