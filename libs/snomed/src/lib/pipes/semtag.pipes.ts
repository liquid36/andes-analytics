import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'semtag' })
export class SemTagPipe implements PipeTransform {
    transform(concept: any): any {
        return getSemanticTagFromFsn(concept.fsn);
    }
}

function getSemanticTagFromFsn(fsn: String) {
    const startAt = fsn.lastIndexOf('(');
    const endAt = fsn.lastIndexOf(')');
    return fsn.substring(startAt + 1, endAt);
}