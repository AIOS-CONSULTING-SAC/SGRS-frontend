import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [  
    CommonModule,
    ProgressSpinnerModule
],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  @Input() show = false

  ngOnInit(): void {
  }
}
