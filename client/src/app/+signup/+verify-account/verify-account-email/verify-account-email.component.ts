import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { I18n } from '@ngx-translate/i18n-polyfill'
import { Notifier } from '@app/core'
import { UserService } from '@app/shared'

@Component({
  selector: 'my-verify-account-email',
  templateUrl: './verify-account-email.component.html'
})

export class VerifyAccountEmailComponent implements OnInit {
  success = false

  private userId: number
  private verificationString: string

  constructor (
    private userService: UserService,
    private notifier: Notifier,
    private router: Router,
    private route: ActivatedRoute,
    private i18n: I18n
  ) {
  }

  ngOnInit () {
    this.userId = this.route.snapshot.queryParams['userId']
    this.verificationString = this.route.snapshot.queryParams['verificationString']

    if (!this.userId || !this.verificationString) {
      this.notifier.error(this.i18n('Unable to find user id or verification string.'))
    } else {
      this.verifyEmail()
    }
  }

  verifyEmail () {
    this.userService.verifyEmail(this.userId, this.verificationString)
      .subscribe(
        () => {
          this.success = true
        },

        err => {
          this.notifier.error(err.message)
        }
      )
  }
}
