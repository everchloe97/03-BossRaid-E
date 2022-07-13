import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class RequestRaidDto {
    
    @IsNotEmpty()
    @IsNumber()
   @ApiProperty({
    example:1,
    description:'조회하고자 하는 user의 id를 보냅니다.'
   }
   )
    userId: number;
}