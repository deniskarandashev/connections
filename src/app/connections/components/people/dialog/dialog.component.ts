import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostListener, Inject, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MainValidator } from "src/app/connections/services/main.validator";

export interface DialogData {
  newGroupName: string;
}

@Component({
  selector: 'rs-dialog-person',
  templateUrl: './dialog.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule
  ],
})
export class PersonDialog implements OnInit {
  form!: FormGroup;
  protected matcher = new ErrorStateMatcher();
  @Output() submitClicked = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<PersonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      groupName: new FormControl(this.data.newGroupName, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30),
        MainValidator.groupNameValidator()
      ])
    });
    this.data.newGroupName = this.groupName.value;
  }

  onClose(): void {
    this.groupName.setValue('');
    this.dialogRef.close();
  }

  @HostListener('window:keydown.enter', ['$event'])
  onCreate(): void {
    if (this.form.valid) {
      this.data.newGroupName = this.groupName.value;
      this.submitClicked.emit(this.data.newGroupName );
      this.groupName.setValue('');
      this.onClose();
    }
  }

  get groupName(): FormControl {
    return <FormControl>this.form.get('groupName');
  }
}