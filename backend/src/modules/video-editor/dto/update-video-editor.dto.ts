import { PartialType } from '@nestjs/swagger';
import { CreateVideoEditorDto } from './create-video-editor.dto';

export class UpdateVideoEditorDto extends PartialType(CreateVideoEditorDto) { }