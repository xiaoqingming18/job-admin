# 求职申请模块接口文档（项目经理侧）

## 1. 申请管理接口

### 1.1 分页查询求职申请列表
- **接口地址**: `/job-application/list`
- **请求方法**: POST
- **接口描述**: 项目经理获取收到的申请列表
- **请求参数**:
  ```json
  {
    "page": 1,                  // 页码，默认1
    "size": 10,                 // 每页大小，默认10
    "projectId": 2,             // 项目ID，用于筛选特定项目下的申请（可选）
    "demandId": 1,              // 劳务需求ID，用于筛选特定需求下的申请（可选）
    "status": "applied",        // 申请状态，用于筛选特定状态的申请（可选）
    "jobSeekerName": "张三"      // 求职者姓名，用于模糊搜索（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "records": [
        {
          "id": 1,
          "jobSeekerId": 10,
          "jobSeekerName": "张三",
          "demandId": 1,
          "demandTitle": "招聘木工10名",
          "expectedEntryDate": "2023-07-15",
          "expectedSalary": 350.00,
          "status": "applied",
          "createTime": "2023-06-20T14:30:45"
        }
      ],
      "total": 8,
      "size": 10,
      "current": 1,
      "pages": 1
    },
    "message": "success"
  }
  ```

### 1.2 获取申请详情
- **接口地址**: `/job-application/detail/{id}`
- **请求方法**: GET
- **接口描述**: 项目经理获取申请详情
- **请求参数**:
  - id: 路径参数，申请ID
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "jobSeekerId": 10,
      "jobSeekerName": "张三",
      "jobSeekerGender": "male",
      "jobSeekerAge": 28,
      "jobSeekerWorkYears": 5,
      "jobSeekerSkill": "精通各类木工操作，熟悉施工图纸...",
      "jobSeekerCertificates": ["高级木工证", "安全作业证"],
      "resumeUrl": "https://minio-server/job-server/resume/xxx.pdf",
      "demandId": 1,
      "demandTitle": "招聘木工10名",
      "projectId": 2,
      "projectName": "某建筑项目",
      "selfIntroduction": "我是一名有5年经验的木工...",
      "expectedEntryDate": "2023-07-15",
      "expectedSalary": 350.00,
      "status": "applied",
      "rejectionReason": null,
      "createTime": "2023-06-20T14:30:45",
      "interviews": [
        {
          "id": 1,
          "applicationId": 1,
          "interviewDate": "2023-06-25T10:00:00",
          "location": "项目部会议室",
          "interviewType": "onsite",
          "remarks": "请带上相关证书原件",
          "status": "scheduled",
          "result": "pending",
          "resultComment": null
        }
      ]
    },
    "message": "success"
  }
  ```

### 1.3 更新申请状态
- **接口地址**: `/job-application/update-status`
- **请求方法**: PUT
- **接口描述**: 更新申请状态（如拒绝或录用）
- **请求参数**:
  ```json
  {
    "id": 1,                            // 申请ID
    "status": "rejected",               // 新状态：applied-已申请，interviewing-面试中，rejected-已拒绝，hired-已录用，cancelled-已取消
    "rejectionReason": "目前已招满所需人数"  // 拒绝原因（当状态为rejected时必须提供）
  }
  ```
- **状态转换规则**:
  - 当前状态为 **applied（已申请）** 时：
    - 可以转换为 interviewing（面试中）
    - 可以转换为 rejected（已拒绝）
    - 可以转换为 hired（已录用）
  - 当前状态为 **interviewing（面试中）** 时：
    - 可以转换为 rejected（已拒绝）
    - 可以转换为 hired（已录用）
  - 当前状态为 **rejected（已拒绝）**、**hired（已录用）** 或 **cancelled（已取消）** 时：
    - 这些是终态，不能再变更为其他状态
  - 任何状态都可以保持不变（相同状态间的转换是允许的）
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": true,
    "message": "success"
  }
  ```
- **错误响应**:
  ```json
  {
    "code": 40001,
    "data": null,
    "message": "无效的状态转换"
  }
  ```

## 2. 面试管理接口

### 2.1 安排面试
- **接口地址**: `/job-application/arrange-interview`
- **请求方法**: POST
- **接口描述**: 为申请安排面试
- **请求参数**:
  ```json
  {
    "applicationId": 1,                // 申请ID
    "interviewDate": "2023-06-25T10:00:00",  // 面试日期时间，必须是将来的时间
    "location": "项目部会议室",           // 面试地点
    "interviewType": "onsite",         // 面试类型：onsite-现场面试，phone-电话面试，video-视频面试
    "remarks": "请带上相关证书原件"       // 备注（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "applicationId": 1,
      "interviewDate": "2023-06-25T10:00:00",
      "location": "项目部会议室",
      "interviewType": "onsite",
      "remarks": "请带上相关证书原件",
      "status": "scheduled",
      "result": "pending",
      "resultComment": null
    },
    "message": "success"
  }
  ```

### 2.2 更新面试状态与结果
- **接口地址**: `/job-application/update-interview`
- **请求方法**: PUT
- **接口描述**: 更新面试状态和结果
- **请求参数**:
  ```json
  {
    "interviewId": 1,                   // 面试ID
    "status": "completed",              // 面试状态：scheduled-已安排，completed-已完成，cancelled-已取消，rescheduled-已重新安排
    "result": "pass",                   // 面试结果（可选，当状态为completed时必须提供）：pending-待定，pass-通过，fail-未通过
    "resultComment": "专业技能出色，沟通良好，符合岗位要求"  // 结果说明（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": true,
    "message": "success"
  }
  ```

### 2.3 项目经理提交面试评价
- **接口地址**: `/job-application/manager-review`
- **请求方法**: POST
- **接口描述**: 项目经理对面试进行评价
- **请求参数**:
  ```json
  {
    "interviewId": 1,                   // 面试ID
    "rating": 5,                        // 评分（1-5分）
    "comment": "求职者专业素养高，技能匹配度好"  // 评价内容
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": true,
    "message": "success"
  }
  ```

### 2.4 获取面试评价列表
- **接口地址**: `/job-application/interview-reviews/{interviewId}`
- **请求方法**: GET
- **接口描述**: 获取特定面试的所有评价
- **请求参数**:
  - interviewId: 路径参数，面试ID
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": 1,
        "reviewerId": 5,
        "reviewerName": "李四",
        "reviewerType": "project_manager",
        "rating": 5,
        "comment": "求职者专业素养高，技能匹配度好",
        "createTime": "2023-06-26T15:30:00"
      },
      {
        "id": 2,
        "reviewerId": 10,
        "reviewerName": "张三",
        "reviewerType": "job_seeker",
        "rating": 4,
        "comment": "面试官很专业，面试环境也很好",
        "createTime": "2023-06-26T16:45:00"
      }
    ],
    "message": "success"
  }
  ```

# 求职申请模块接口文档（求职者侧）

## 1. 申请管理接口

### 1.1 提交求职申请
- **接口地址**: `/api/job-seeker/applications`
- **请求方法**: POST
- **接口描述**: 求职者提交求职申请
- **请求参数**:
  ```json
  {
    "demandId": 1,                    // 劳务需求ID
    "selfIntroduction": "我是一名有5年经验的木工...",  // 自我介绍/申请留言（可选）
    "expectedSalary": 350,            // 期望薪资（可选）
    "expectedStartDate": "2023-07-15" // 期望入职时间（可选，格式yyyy-MM-dd）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "jobSeekerId": 10,
      "jobSeekerName": "张三",
      "jobSeekerGender": "male",
      "jobSeekerAge": 28,
      "jobSeekerWorkYears": 5,
      "jobSeekerSkill": "精通各类木工操作，熟悉施工图纸...",
      "resumeUrl": "https://minio-server/job-server/resume/xxx.pdf",
      "demandId": 1,
      "demandTitle": "招聘木工10名",
      "projectId": 2,
      "projectName": "某建筑项目",
      "selfIntroduction": "我是一名有5年经验的木工...",
      "expectedEntryDate": "2023-07-15",
      "expectedSalary": 350.00,
      "status": "applied",
      "rejectionReason": null,
      "createTime": "2023-06-20T14:30:45",
      "interviews": []
    },
    "message": "success"
  }
  ```

### 1.2 获取我的申请列表
- **接口地址**: `/api/job-seeker/applications`
- **请求方法**: GET
- **接口描述**: 求职者获取自己的申请列表
- **请求参数**:
  - page: 查询参数，页码，默认1
  - size: 查询参数，每页大小，默认10
  - status: 查询参数，申请状态，用于筛选特定状态的申请（可选）
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "list": [
        {
          "id": 1,
          "jobSeekerId": 10,
          "jobSeekerName": "张三",
          "demandId": 1,
          "demandTitle": "招聘木工10名",
          "expectedEntryDate": "2023-07-15",
          "expectedSalary": 350.00,
          "status": "applied",
          "createTime": "2023-06-20T14:30:45"
        }
      ],
      "total": 8,
      "pageNum": 1,
      "pageSize": 10,
      "totalPages": 1
    },
    "message": "success"
  }
  ```

### 1.3 获取我的申请详情
- **接口地址**: `/api/job-seeker/applications/{applicationId}`
- **请求方法**: GET
- **接口描述**: 求职者获取自己的申请详情
- **请求参数**:
  - applicationId: 路径参数，申请ID
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "jobSeekerId": 10,
      "jobSeekerName": "张三",
      "jobSeekerGender": "male",
      "jobSeekerAge": 28,
      "jobSeekerWorkYears": 5,
      "jobSeekerSkill": "精通各类木工操作，熟悉施工图纸...",
      "resumeUrl": "https://minio-server/job-server/resume/xxx.pdf",
      "demandId": 1,
      "demandTitle": "招聘木工10名",
      "projectId": 2,
      "projectName": "某建筑项目",
      "selfIntroduction": "我是一名有5年经验的木工...",
      "expectedEntryDate": "2023-07-15",
      "expectedSalary": 350.00,
      "status": "applied",
      "rejectionReason": null,
      "createTime": "2023-06-20T14:30:45",
      "interviews": [
        {
          "id": 1,
          "applicationId": 1,
          "interviewDate": "2023-06-25T10:00:00",
          "location": "项目部会议室",
          "interviewType": "onsite",
          "remarks": "请带上相关证书原件",
          "status": "scheduled",
          "result": "pending",
          "resultComment": null
        }
      ]
    },
    "message": "success"
  }
  ```

### 1.4 取消申请
- **接口地址**: `/api/job-seeker/applications/{applicationId}/cancel`
- **请求方法**: POST
- **接口描述**: 求职者取消自己的申请
- **请求参数**:
  - applicationId: 路径参数，申请ID
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": true,
    "message": "success"
  }
  ```

## 2. 面试评价接口

### 2.1 提交面试评价
- **接口地址**: `/api/job-seeker/applications/reviews`
- **请求方法**: POST
- **接口描述**: 允许求职者对参加过的面试进行评价，包括评分、评价内容、面试问题记录和是否推荐该公司
- **请求参数**:
  ```json
  {
    "interviewId": 1,                      // 面试ID
    "rating": 4,                           // 评分（1-5分）
    "comment": "面试官很专业，面试环境也很好",  // 评价内容
    "interviewQuestions": "主要问了我的工作经验和技能水平，还问了安全施工知识...", // 面试问题记录（可选）
    "recommended": 1                       // 是否推荐该公司（0-不推荐，1-推荐）（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "data": true,
    "message": "success"
  }
  ```
