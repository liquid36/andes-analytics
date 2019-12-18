import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'term' })
export class TermPipe implements PipeTransform {
    transform(concept: any): any {
        return extractSemtagFrom(concept.term || concept.preferredTerm);
    }
}

function extractSemtagFrom(fsn: String) {
    const startAt = fsn.lastIndexOf('(');
    if (startAt > 0) {
        return fsn.substring(0, startAt - 1);
    }
    return fsn;
}