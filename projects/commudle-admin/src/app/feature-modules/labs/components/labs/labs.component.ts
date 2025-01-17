import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LabsService } from 'projects/commudle-admin/src/app/feature-modules/labs/services/labs.service';
import { ILab } from 'projects/shared-models/lab.model';
import { ILabs } from 'projects/shared-models/labs.model';
import { ITag } from 'projects/shared-models/tag.model';
import { ITags } from 'projects/shared-models/tags.model';

@Component({
  selector: 'app-labs',
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.scss'],
})
export class LabsComponent implements OnInit {
  page = 1;
  count = 9;
  total = -1;

  popularTags: ITag[] = [];
  popularLabs: ILab[] = [];

  searchedTags: string[] = [];
  searchedLabs: ILab[] = [];

  isLoading = false;

  constructor(private meta: Meta, private title: Title, private labsService: LabsService) {}

  ngOnInit() {
    this.setMeta();

    this.getPopularTags();
    this.getLabsByTags();
  }

  setMeta() {
    this.title.setTitle('Labs - Step By Step Tutorials');
    this.meta.updateTag({
      name: 'description',
      content:
        'Labs are guided hands-on tutorials published by software developers. They teach you algorithms, help you create small apps & projects and cover topics including Web, Flutter, Android, iOS, Data Structures, ML & AI.',
    });
    this.meta.updateTag({
      name: 'og:image',
      content: `https://commudle.com/assets/images/commudle-logo192.png`,
    });
    this.meta.updateTag({
      name: 'og:image:secure_url',
      content: `https://commudle.com/assets/images/commudle-logo192.png`,
    });
    this.meta.updateTag({
      name: 'og:title',
      content:
        'Labs are guided hands-on tutorials published by software developers. They teach you algorithms, help you create small apps & projects and cover topics including Web, Flutter, Android, iOS, Data Structures, ML & AI.',
    });
    this.meta.updateTag({
      name: 'og:description',
      content:
        'Labs are guided hands-on tutorials published by software developers. They teach you algorithms, help you create small apps & projects and cover topics including Web, Flutter, Android, iOS, Data Structures, ML & AI.',
    });
    this.meta.updateTag({
      name: 'og:type',
      content: 'website',
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: `https://commudle.com/assets/images/commudle-logo192.png`,
    });
    this.meta.updateTag({
      name: 'twitter:title',
      content: 'Labs - Step By Step Tutorials',
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content:
        'Labs are guided hands-on tutorials published by software developers. They teach you algorithms, help you create small apps & projects and topics including Web, Flutter, Android, iOS, Data Structures, ML & AI.',
    });
  }

  getPopularTags() {
    this.labsService.pTags().subscribe((data: ITags) => (this.popularTags = data.tags.slice(0, 6)));
  }

  onTagAdd(value: string) {
    if (!this.searchedTags.includes(value)) {
      this.searchedTags.push(value);
      this.total = -1;
      this.page = 1;
      this.count = 9;
      this.getLabsByTags(true);
    }
  }

  onTagsUpdate(tags: string[]) {
    this.searchedTags = tags || [];
    this.total = -1;
    this.page = 1;
    this.count = 9;
    this.getLabsByTags(true);
  }

  getLabsByTags(replace: boolean = false): void {
    this.isLoading = true;
    this.labsService.searchLabsByTags(this.searchedTags, this.page, this.count).subscribe((value: ILabs) => {
      this.searchedLabs = replace ? value.labs : this.searchedLabs.concat(value.labs);
      this.total = value.total;
      this.count = value.count;
      this.page++;
      this.isLoading = false;
    });
  }
}
