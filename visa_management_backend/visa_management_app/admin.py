from django.contrib import admin
from .models import StudentInfo,User,Reservation,Schedule,RequestLetter
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserChangeForm, CustomUserCreationForm

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('username', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    search_fields = ('username',)
    ordering = ('username',)
    filter_horizontal = ()

@admin.register(Reservation)
class ReservasionAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'is_available')
    list_filter = ('date', 'is_available')
    search_fields = ('student__student_id',)

class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('date', 'is_reservable')  # 管理画面で表示するフィールド
    list_editable = ('is_reservable',)        # リストから直接編集可能なフィールド
    list_filter = ('is_reservable',)          # フィルタリングオプションを追加
    search_fields = ('date',)                 # 検索フィールドを追加

class RequestLetterAdmin(admin.ModelAdmin):
    list_display = ('student', 'is_requested','complete_date','is_completed')  # 管理画面で表示するフィールド
    list_editable = ('is_completed','complete_date')        # リストから直接編集可能なフィールド
    list_filter = ('student',)          # フィルタリングオプションを追加
    search_fields = ('is_requested',)                 # 検索フィールドを追加

admin.site.register(Schedule, ScheduleAdmin)    
admin.site.register(User,UserAdmin)
admin.site.register(StudentInfo)
admin.site.register(RequestLetter,RequestLetterAdmin)