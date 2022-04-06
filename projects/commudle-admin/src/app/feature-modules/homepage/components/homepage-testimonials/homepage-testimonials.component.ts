import { Component, OnInit } from '@angular/core';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';
import { SanityImageObject } from '@sanity/image-url/lib/types/types';
import { ITestimonial } from 'projects/commudle-admin/src/app/feature-modules/homepage/models/testimonial.model';
import { CmsService } from 'projects/shared-services/cms.service';

@Component({
  selector: 'app-homepage-testimonials',
  templateUrl: './homepage-testimonials.component.html',
  styleUrls: ['./homepage-testimonials.component.scss'],
})
export class HomepageTestimonialsComponent implements OnInit {
  testimonials: ITestimonial[] = [];
  selectedTestimonial: ITestimonial;

  constructor(private cmsService: CmsService) {}

  ngOnInit(): void {
    this.getTestimonials();
  }

  getTestimonials() {
    this.cmsService.getDataByType('testimonials').subscribe((value: ITestimonial[]) => {
      this.testimonials = value;
      this.selectedTestimonial = this.testimonials[0];
    });
  }

  setTestimonial(direction: number) {
    const index = this.testimonials.indexOf(this.selectedTestimonial);
    this.selectedTestimonial =
      direction === 1
        ? index === this.testimonials.length - 1
          ? this.testimonials[0]
          : this.testimonials[index + 1]
        : index === 0
        ? this.testimonials[this.testimonials.length - 1]
        : this.testimonials[index - 1];
  }

  getImageUrl(value: SanityImageObject): ImageUrlBuilder {
    if (!value) return null;

    return this.cmsService.getImageUrl(value);
  }
}