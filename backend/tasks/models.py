from django.db import models


class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    priority = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Habit(models.Model):
    CATEGORY_CHOICES = [
        ('journaling', 'Journaling'),
        ('fitness', 'Fitness'),
        ('nutrition', 'Nutrition'),
        ('supplement', 'Supplement'),
        ('sleep', 'Sleep'),
        ('mood', 'Mood'),
        ('screen_time', 'Screen Time'),
        ('study', 'Study'),
        ('custom', 'Custom'),
    ]
    is_numeric = models.BooleanField(default=False)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='custom')
    reminder_time = models.TimeField(null=True, blank=True)
    goal_value = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    is_completed = models.BooleanField(default=False)
    value = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.habit.name} - {self.date}"